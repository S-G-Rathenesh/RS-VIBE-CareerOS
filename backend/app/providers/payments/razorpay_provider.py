"""Real Razorpay Payment Provider using the official razorpay Python SDK.

Handles:
- Plan creation / retrieval for ₹69/month Golden Membership
- Subscription creation for checkout
- Payment signature verification (HMAC SHA256)
- Webhook signature verification
- Subscription cancellation
"""
from __future__ import annotations

import hmac
import hashlib
import asyncio
from typing import Dict, Any, Optional

import razorpay
from razorpay.errors import SignatureVerificationError

from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import APIException


# Amount in paise (₹69 = 6900 paise)
GOLDEN_AMOUNT_PAISE = 6900
GOLDEN_CURRENCY = "INR"
GOLDEN_PLAN_INTERVAL = 1  # 1 month
GOLDEN_PLAN_PERIOD = "monthly"


class RazorpayPaymentProvider:
    """Real Razorpay subscription, payment verification, and webhook provider."""

    def __init__(self):
        self._client: Optional[razorpay.Client] = None
        self._plan_id: Optional[str] = None
        self._plan_lock = asyncio.Lock()

    @property
    def client(self) -> razorpay.Client:
        """Lazy-initialised Razorpay client. Errors early if keys are missing."""
        if self._client is None:
            if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
                raise APIException(
                    status_code=503,
                    message="Razorpay payment gateway is not configured. Please contact support.",
                    code="PAYMENT_GATEWAY_UNAVAILABLE",
                )
            self._client = razorpay.Client(
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
            )
        return self._client

    # ------------------------------------------------------------------
    # Plan management
    # ------------------------------------------------------------------
    async def ensure_plan_id(self) -> str:
        """Return cached plan_id, or create a new Razorpay plan for Golden Membership."""
        async with self._plan_lock:
            # 1. Check in-memory cache
            if self._plan_id:
                return self._plan_id

            # 2. Check env var
            if settings.RAZORPAY_PLAN_ID:
                self._plan_id = settings.RAZORPAY_PLAN_ID
                return self._plan_id

            # 3. Check MongoDB cache
            from app.database.mongodb import db_manager
            if db_manager.db is not None:
                cached = await db_manager.db["razorpay_settings"].find_one({"key": "golden_plan_id"})
                if cached and cached.get("value"):
                    self._plan_id = cached["value"]
                    return self._plan_id

            # 4. Create plan via Razorpay API
            try:
                plan_data = {
                    "period": GOLDEN_PLAN_PERIOD,
                    "interval": GOLDEN_PLAN_INTERVAL,
                    "item": {
                        "name": "Golden Membership",
                        "amount": GOLDEN_AMOUNT_PAISE,
                        "currency": GOLDEN_CURRENCY,
                        "description": "RS VIBE CareerOS Golden Membership — ₹69/month",
                    },
                }
                logger.info("Creating new Razorpay plan for Golden Membership")
                plan = self.client.plan.create(data=plan_data)
                self._plan_id = plan["id"]
                logger.info("Razorpay Golden plan created", plan_id=self._plan_id)

                # Persist to MongoDB
                if db_manager.db is not None:
                    await db_manager.db["razorpay_settings"].update_one(
                        {"key": "golden_plan_id"},
                        {"$set": {"key": "golden_plan_id", "value": self._plan_id}},
                        upsert=True,
                    )
                return self._plan_id
            except razorpay.errors.BadRequestError as exc:
                logger.error(
                    "Razorpay BadRequestError during plan creation",
                    error=str(exc),
                    operation="plan.create",
                )
                raise APIException(
                    status_code=502,
                    message="Payment gateway configuration error. Please contact support.",
                    code="RAZORPAY_PLAN_CREATION_BAD_REQUEST",
                )
            except Exception as exc:
                logger.error(
                    "Failed to create Razorpay plan", 
                    error=str(exc),
                    operation="plan.create"
                )
                raise APIException(
                    status_code=502,
                    message="Payment gateway is temporarily unavailable. Please try again later.",
                    code="RAZORPAY_PLAN_CREATION_FAILED",
                )

    # ------------------------------------------------------------------
    # Subscription (checkout) creation
    # ------------------------------------------------------------------
    async def create_subscription(self, user_id: str, user_email: str) -> Dict[str, Any]:
        """Create a real Razorpay subscription for the Golden Membership plan."""
        plan_id = await self.ensure_plan_id()

        try:
            subscription_data: Dict[str, Any] = {
                "plan_id": plan_id,
                "customer_notify": 1,
                "total_count": 120,  # Up to 10 years of renewals
                "notes": {
                    "user_id": user_id,
                    "user_email": user_email,
                    "plan": "golden",
                },
            }
            logger.info("Creating Razorpay subscription", plan_id=plan_id, user_id=user_id)
            subscription = self.client.subscription.create(data=subscription_data)
            logger.info(
                "Razorpay subscription created",
                subscription_id=subscription["id"],
                user_id=user_id,
            )
            return {
                "subscription_id": subscription["id"],
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                "plan_name": "Golden Membership",
                "amount": GOLDEN_AMOUNT_PAISE,
                "currency": GOLDEN_CURRENCY,
            }
        except APIException:
            raise
        except razorpay.errors.BadRequestError as exc:
            logger.error(
                "Razorpay BadRequestError during subscription creation",
                error=str(exc),
                operation="subscription.create",
            )
            raise APIException(
                status_code=502,
                message="Subscription creation failed due to configuration. Please try again.",
                code="RAZORPAY_SUBSCRIPTION_BAD_REQUEST",
            )
        except Exception as exc:
            logger.error(
                "Razorpay subscription creation failed", 
                error=str(exc),
                operation="subscription.create"
            )
            raise APIException(
                status_code=502,
                message="Payment gateway is temporarily unavailable. Please try again.",
                code="RAZORPAY_SUBSCRIPTION_FAILED",
            )

    # ------------------------------------------------------------------
    # Payment signature verification (after frontend checkout)
    # ------------------------------------------------------------------
    def verify_subscription_payment(
        self,
        razorpay_payment_id: str,
        razorpay_subscription_id: str,
        razorpay_signature: str,
    ) -> bool:
        """Verify Razorpay payment signature using the official SDK utility."""
        try:
            self.client.utility.verify_subscription_payment_signature({
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_subscription_id": razorpay_subscription_id,
                "razorpay_signature": razorpay_signature,
            })
            return True
        except SignatureVerificationError:
            logger.warning(
                "Razorpay signature verification failed",
                payment_id=razorpay_payment_id,
                subscription_id=razorpay_subscription_id,
            )
            return False
        except Exception as exc:
            logger.error("Razorpay signature verification error", error=str(exc))
            return False

    # ------------------------------------------------------------------
    # Webhook signature verification
    # ------------------------------------------------------------------
    def verify_webhook_signature(self, payload_body: bytes, signature: str) -> bool:
        """Verify Razorpay webhook payload signature using HMAC SHA256."""
        webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET
        if not webhook_secret:
            logger.warning("RAZORPAY_WEBHOOK_SECRET not configured — rejecting webhook")
            return False

        try:
            expected = hmac.new(
                webhook_secret.encode("utf-8"),
                payload_body,
                hashlib.sha256,
            ).hexdigest()
            return hmac.compare_digest(expected, signature)
        except Exception as exc:
            logger.error("Webhook signature verification error", error=str(exc))
            return False

    # ------------------------------------------------------------------
    # Subscription cancellation
    # ------------------------------------------------------------------
    def cancel_subscription(self, subscription_id: str) -> bool:
        """Cancel a Razorpay subscription at end of billing cycle."""
        try:
            self.client.subscription.cancel(subscription_id, {"cancel_at_cycle_end": 1})
            logger.info("Razorpay subscription cancelled", subscription_id=subscription_id)
            return True
        except Exception as exc:
            logger.error("Razorpay subscription cancellation failed", error=str(exc))
            return False


razorpay_provider = RazorpayPaymentProvider()
