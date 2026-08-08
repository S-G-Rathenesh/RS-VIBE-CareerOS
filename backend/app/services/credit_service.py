from datetime import datetime, timezone, timedelta
from typing import List, Dict
from app.schemas.credit import CreditTransactionItem, UserCreditBalanceResponse
from app.services.subscription_service import SubscriptionService
from app.database.mongodb import db_manager
from app.core.exceptions import APIException


class CreditService:
    """AI Credit Ledger & Usage Tracking Service with daily safety limit."""

    ACTION_COSTS: Dict[str, int] = {
        "RESUME_ANALYSIS": 10,
        "TEXT_ENHANCEMENT": 3,
        "COVER_LETTER": 5,
        "INTERVIEW_SIMULATION": 20,
        "SUMMARY_GEN": 5,
        "ATS_SCORE": 10,
    }

    DAILY_SAFETY_LIMIT = 20  # Max AI credits consumable per calendar day (UTC)

    @classmethod
    async def _get_daily_usage(cls, user_id: str, date_str: str) -> int:
        """Return total credits used by user on a given UTC date."""
        db = db_manager.db
        if db is None:
            return 0
        doc = await db["daily_ai_credits"].find_one({"user_id": user_id, "date": date_str})
        return doc.get("credits_used", 0) if doc else 0

    @classmethod
    async def _increment_daily_usage(cls, user_id: str, date_str: str, amount: int) -> None:
        """Atomically increment daily credit usage counter."""
        db = db_manager.db
        if db is None:
            return
        await db["daily_ai_credits"].update_one(
            {"user_id": user_id, "date": date_str},
            {"$inc": {"credits_used": amount}},
            upsert=True,
        )

    @classmethod
    async def deduct_credits(cls, user_id: str, action_type: str, prompt_summary: str = "") -> int:
        """Validate & deduct credits from user's monthly quota balance.

        Enforces:
        1. Monthly credit quota (402 Payment Required)
        2. Daily safety limit of 20 credits/day (429 Too Many Requests)
        """
        cost = cls.ACTION_COSTS.get(action_type, 5)
        status = await SubscriptionService.get_user_subscription(user_id)

        # --- Check 1: Monthly quota ---
        if status.ai_credits_remaining < cost:
            raise APIException(
                status_code=402,
                message=(
                    f"Insufficient AI Credits for '{action_type}'. "
                    f"Requires {cost} credits, but you have {status.ai_credits_remaining} remaining. "
                    f"Please upgrade your plan in Settings → Subscription & Limits."
                ),
                code="INSUFFICIENT_CREDITS",
            )

        # --- Check 2: Daily safety limit ---
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        daily_used = await cls._get_daily_usage(user_id, today_str)
        if daily_used + cost > cls.DAILY_SAFETY_LIMIT:
            tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
            raise APIException(
                status_code=429,
                message=(
                    f"Daily AI safety limit reached ({cls.DAILY_SAFETY_LIMIT} credits/day). "
                    f"You have used {daily_used} credits today. "
                    f"You can use AI features again after {tomorrow} 00:00 UTC."
                ),
                code="DAILY_LIMIT_REACHED",
            )

        db = db_manager.db
        if db is not None:
            # Increment user's used credits counter
            await db["users"].update_one(
                {"_id": user_id},
                {"$inc": {"ai_credits_used": cost}}
            )

            # Increment daily usage
            await cls._increment_daily_usage(user_id, today_str, cost)

            new_balance = status.ai_credits_remaining - cost

            # Insert credit ledger audit transaction record
            tx_doc = {
                "user_id": user_id,
                "action_type": action_type,
                "credits_deducted": cost,
                "balance_after": new_balance,
                "prompt_summary": prompt_summary or action_type,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            await db["ai_credit_transactions"].insert_one(tx_doc)
            return new_balance

        return status.ai_credits_remaining - cost

    @classmethod
    async def get_credit_history(cls, user_id: str) -> UserCreditBalanceResponse:
        """Fetch user credit balance and transaction history."""
        status = await SubscriptionService.get_user_subscription(user_id)
        db = db_manager.db
        recent_txs = []

        if db is not None:
            cursor = db["ai_credit_transactions"].find({"user_id": user_id}).sort("timestamp", -1)
            docs = await cursor.to_list(length=50)

            for doc in docs:
                recent_txs.append(
                    CreditTransactionItem(
                        id=str(doc.get("_id")),
                        action_type=doc.get("action_type", "AI_EXECUTION"),
                        credits_deducted=doc.get("credits_deducted", 5),
                        balance_after=doc.get("balance_after", 0),
                        prompt_summary=doc.get("prompt_summary", ""),
                        timestamp=doc.get("timestamp", "")
                    )
                )

        # Daily usage
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        daily_used = await cls._get_daily_usage(user_id, today_str)

        return UserCreditBalanceResponse(
            credits_remaining=status.ai_credits_remaining,
            monthly_limit=status.ai_credits_limit,
            daily_credits_used=daily_used,
            daily_credits_limit=cls.DAILY_SAFETY_LIMIT,
            tier=status.tier.value.upper(),
            recent_transactions=recent_txs
        )
