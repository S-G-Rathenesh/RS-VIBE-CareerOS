"""Payment Service — Real Razorpay checkout, verification, and webhook processing."""
from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
from app.schemas.payment import (
    CreateCheckoutRequest,
    RazorpayCheckoutResponse,
    RazorpayVerifyRequest,
    InvoiceItem,
    PaymentProvider,
)
from app.providers.payments.razorpay_provider import razorpay_provider
from app.services.subscription_service import SubscriptionService
from app.database.mongodb import db_manager
from app.core.exceptions import APIException
from app.core.logging import logger


class PaymentService:
    """Payment ledger, checkout orchestration, subscription lifecycle, and webhook processing."""

    # ------------------------------------------------------------------
    # Checkout — create Razorpay subscription
    # ------------------------------------------------------------------
    @classmethod
    async def create_checkout(
        cls,
        user_id: str,
        user_email: str,
        request: CreateCheckoutRequest,
    ) -> RazorpayCheckoutResponse:
        """Create a real Razorpay subscription for Golden Membership."""
        tier = request.plan_tier.lower()
        if tier != "golden":
            raise APIException(status_code=400, message="Only the 'golden' plan is available for upgrade.")

        if request.provider != PaymentProvider.RAZORPAY:
            raise APIException(status_code=400, message="Only Razorpay payments are supported for this launch.")

        # Check if already on Golden
        sub_status = await SubscriptionService.get_user_subscription(user_id)
        if sub_status.tier.value == "golden" and sub_status.status == "active" and not sub_status.cancel_at_period_end:
            raise APIException(status_code=409, message="You already have an active Golden Membership.")

        # Create real Razorpay subscription
        result = await razorpay_provider.create_subscription(user_id, user_email)

        # Record pending payment in DB
        db = db_manager.db
        if db is not None:
            await db["payments"].insert_one({
                "user_id": user_id,
                "user_email": user_email,
                "provider": "razorpay",
                "razorpay_subscription_id": result["subscription_id"],
                "plan_tier": "golden",
                "billing_cycle": "monthly",
                "amount": 69.0,
                "currency": "INR",
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat(),
            })

        return RazorpayCheckoutResponse(**result)

    # ------------------------------------------------------------------
    # Verify — after frontend Razorpay checkout
    # ------------------------------------------------------------------
    @classmethod
    async def verify_razorpay_payment(
        cls,
        user_id: str,
        verify_data: RazorpayVerifyRequest,
    ) -> Dict[str, Any]:
        """Verify Razorpay payment signature and activate Golden Membership.

        Returns subscription status dict on success.
        Raises APIException on verification failure.
        """
        # Server-side signature verification
        is_valid = razorpay_provider.verify_subscription_payment(
            razorpay_payment_id=verify_data.razorpay_payment_id,
            razorpay_subscription_id=verify_data.razorpay_subscription_id,
            razorpay_signature=verify_data.razorpay_signature,
        )
        if not is_valid:
            raise APIException(
                status_code=400,
                message="Payment signature verification failed. Payment was NOT processed.",
                code="INVALID_PAYMENT_SIGNATURE",
            )

        # Idempotency: check if this payment was already processed
        db = db_manager.db
        if db is not None:
            existing = await db["payments"].find_one({
                "razorpay_payment_id": verify_data.razorpay_payment_id,
                "status": "completed",
            })
            if existing:
                logger.info("Duplicate payment verification skipped", payment_id=verify_data.razorpay_payment_id)
                status = await SubscriptionService.get_user_subscription(user_id)
                return {"message": "Payment already processed.", "subscription": status.model_dump()}

        # Activate Golden Membership
        await cls._activate_golden(
            user_id=user_id,
            razorpay_subscription_id=verify_data.razorpay_subscription_id,
            razorpay_payment_id=verify_data.razorpay_payment_id,
        )

        status = await SubscriptionService.get_user_subscription(user_id)
        return {"message": "Golden Membership activated successfully!", "subscription": status.model_dump()}

    # ------------------------------------------------------------------
    # Webhook processing
    # ------------------------------------------------------------------
    @classmethod
    async def process_webhook_event(cls, event: str, payload: Dict[str, Any]) -> Dict[str, str]:
        """Process a verified Razorpay webhook event.

        Handles subscription lifecycle events with idempotency.
        """
        entity = payload.get("payload", {})

        if event == "subscription.activated":
            return await cls._handle_subscription_activated(entity)
        elif event in ("subscription.charged", "payment.captured"):
            return await cls._handle_subscription_charged(entity)
        elif event == "subscription.cancelled":
            return await cls._handle_subscription_cancelled(entity)
        elif event in ("subscription.completed", "subscription.expired"):
            return await cls._handle_subscription_expired(entity)
        elif event in ("payment.failed", "subscription.halted"):
            return await cls._handle_payment_failed(entity)
        else:
            logger.info("Ignoring unhandled Razorpay webhook event", event=event)
            return {"status": "ignored", "event": event}

    # ------------------------------------------------------------------
    # Webhook handlers (private)
    # ------------------------------------------------------------------
    @classmethod
    async def _handle_subscription_activated(cls, entity: Dict) -> Dict[str, str]:
        sub_data = entity.get("subscription", {}).get("entity", {})
        sub_id = sub_data.get("id")
        notes = sub_data.get("notes", {})
        user_id = notes.get("user_id")
        if not user_id or not sub_id:
            return {"status": "skipped", "reason": "missing user_id or subscription_id"}

        await cls._activate_golden(user_id=user_id, razorpay_subscription_id=sub_id)
        return {"status": "activated", "user_id": user_id}

    @classmethod
    async def _handle_subscription_charged(cls, entity: Dict) -> Dict[str, str]:
        """Handle recurring payment success (renewal)."""
        payment_data = entity.get("payment", {}).get("entity", {})
        payment_id = payment_data.get("id")
        sub_data = entity.get("subscription", {}).get("entity", {})
        sub_id = sub_data.get("id") if sub_data else payment_data.get("subscription_id")
        notes = sub_data.get("notes", {}) if sub_data else payment_data.get("notes", {})
        user_id = notes.get("user_id")

        if not user_id:
            # Try to find user by subscription ID
            db = db_manager.db
            if db is not None and sub_id:
                user = await db["users"].find_one({"razorpay_subscription_id": sub_id})
                if user:
                    user_id = str(user["_id"])

        if not user_id:
            return {"status": "skipped", "reason": "could not resolve user_id"}

        # Idempotency — skip if payment_id already recorded
        db = db_manager.db
        if db is not None and payment_id:
            existing = await db["payments"].find_one({
                "razorpay_payment_id": payment_id,
                "status": "completed",
            })
            if existing:
                return {"status": "skipped", "reason": "payment already processed"}

        # Reset credits for new billing period and record payment
        now = datetime.now(timezone.utc)
        period_end = now + timedelta(days=30)

        if db is not None:
            await db["users"].update_one(
                {"_id": user_id},
                {"$set": {
                    "subscription_tier": "golden",
                    "subscription_status": "active",
                    "ai_credits_used": 0,
                    "current_period_start": now.isoformat(),
                    "current_period_end": period_end.isoformat(),
                    "cancel_at_period_end": False,
                    "updated_at": now.isoformat(),
                }}
            )
            if payment_id:
                await db["payments"].update_one(
                    {"razorpay_payment_id": payment_id},
                    {"$setOnInsert": {
                        "user_id": user_id,
                        "provider": "razorpay",
                        "razorpay_payment_id": payment_id,
                        "razorpay_subscription_id": sub_id,
                        "plan_tier": "golden",
                        "billing_cycle": "monthly",
                        "amount": 69.0,
                        "currency": "INR",
                        "status": "completed",
                        "created_at": now.isoformat(),
                    }},
                    upsert=True,
                )

        return {"status": "renewed", "user_id": user_id}

    @classmethod
    async def _handle_subscription_cancelled(cls, entity: Dict) -> Dict[str, str]:
        sub_data = entity.get("subscription", {}).get("entity", {})
        sub_id = sub_data.get("id")
        notes = sub_data.get("notes", {})
        user_id = notes.get("user_id")

        if not user_id:
            db = db_manager.db
            if db is not None and sub_id:
                user = await db["users"].find_one({"razorpay_subscription_id": sub_id})
                if user:
                    user_id = str(user["_id"])

        if not user_id:
            return {"status": "skipped", "reason": "could not resolve user_id"}

        db = db_manager.db
        if db is not None:
            await db["users"].update_one(
                {"_id": user_id},
                {"$set": {
                    "cancel_at_period_end": True,
                    "subscription_status": "canceled",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }}
            )
        return {"status": "cancelled", "user_id": user_id}

    @classmethod
    async def _handle_subscription_expired(cls, entity: Dict) -> Dict[str, str]:
        sub_data = entity.get("subscription", {}).get("entity", {})
        sub_id = sub_data.get("id")
        notes = sub_data.get("notes", {})
        user_id = notes.get("user_id")

        if not user_id:
            db = db_manager.db
            if db is not None and sub_id:
                user = await db["users"].find_one({"razorpay_subscription_id": sub_id})
                if user:
                    user_id = str(user["_id"])

        if not user_id:
            return {"status": "skipped", "reason": "could not resolve user_id"}

        db = db_manager.db
        if db is not None:
            await db["users"].update_one(
                {"_id": user_id},
                {"$set": {
                    "subscription_tier": "free",
                    "subscription_status": "expired",
                    "razorpay_subscription_id": None,
                    "cancel_at_period_end": False,
                    "ai_credits_used": 0,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }}
            )
        return {"status": "expired", "user_id": user_id}

    @classmethod
    async def _handle_payment_failed(cls, entity: Dict) -> Dict[str, str]:
        payment_data = entity.get("payment", {}).get("entity", {})
        sub_data = entity.get("subscription", {}).get("entity", {})
        notes = sub_data.get("notes", {}) if sub_data else payment_data.get("notes", {})
        user_id = notes.get("user_id")
        if not user_id:
            return {"status": "skipped", "reason": "could not resolve user_id"}

        db = db_manager.db
        if db is not None:
            await db["users"].update_one(
                {"_id": user_id},
                {"$set": {
                    "subscription_status": "past_due",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }}
            )
        logger.warning("Payment failed for user", user_id=user_id)
        return {"status": "payment_failed", "user_id": user_id}

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    @classmethod
    async def _activate_golden(
        cls,
        user_id: str,
        razorpay_subscription_id: str,
        razorpay_payment_id: Optional[str] = None,
    ) -> None:
        """Activate Golden Membership for a user. Idempotent on payment_id."""
        now = datetime.now(timezone.utc)
        period_end = now + timedelta(days=30)

        db = db_manager.db
        if db is not None:
            await db["users"].update_one(
                {"_id": user_id},
                {"$set": {
                    "subscription_tier": "golden",
                    "subscription_status": "active",
                    "razorpay_subscription_id": razorpay_subscription_id,
                    "ai_credits_used": 0,
                    "current_period_start": now.isoformat(),
                    "current_period_end": period_end.isoformat(),
                    "cancel_at_period_end": False,
                    "updated_at": now.isoformat(),
                }}
            )

            # Update payment record if payment_id provided
            if razorpay_payment_id:
                await db["payments"].update_one(
                    {"razorpay_subscription_id": razorpay_subscription_id, "status": "pending"},
                    {"$set": {
                        "status": "completed",
                        "razorpay_payment_id": razorpay_payment_id,
                        "completed_at": now.isoformat(),
                    }}
                )

        logger.info("Golden Membership activated", user_id=user_id, subscription_id=razorpay_subscription_id)

    # ------------------------------------------------------------------
    # Invoices (unchanged)
    # ------------------------------------------------------------------
    @classmethod
    async def get_user_invoices(cls, user_id: str) -> List[InvoiceItem]:
        """Fetch billing invoices history for user."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["payments"].find({"user_id": user_id}).sort("created_at", -1)
        payments = await cursor.to_list(length=100)

        invoices = []
        for p in payments:
            invoices.append(
                InvoiceItem(
                    id=str(p.get("_id")),
                    transaction_id=p.get("razorpay_payment_id", p.get("transaction_id", "N/A")),
                    amount=p.get("amount", 0.0),
                    currency=p.get("currency", "INR"),
                    plan_tier=p.get("plan_tier", "golden").upper(),
                    billing_cycle=p.get("billing_cycle", "monthly"),
                    provider=p.get("provider", "razorpay"),
                    status=p.get("status", "completed"),
                    invoice_url=None,
                    created_at=p.get("created_at", "")
                )
            )
        return invoices

    # ------------------------------------------------------------------
    # Cancel subscription
    # ------------------------------------------------------------------
    @classmethod
    async def cancel_subscription(cls, user_id: str) -> bool:
        """Cancel subscription at end of billing period via Razorpay API."""
        db = db_manager.db
        if db is not None:
            user = await db["users"].find_one({"_id": user_id})
            sub_id = user.get("razorpay_subscription_id") if user else None

            # Cancel on Razorpay side
            if sub_id:
                razorpay_provider.cancel_subscription(sub_id)

            await db["users"].update_one(
                {"_id": user_id},
                {"$set": {
                    "cancel_at_period_end": True,
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                }}
            )
        return True
