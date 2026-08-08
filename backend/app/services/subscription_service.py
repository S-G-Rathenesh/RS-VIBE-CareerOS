from typing import List, Dict
from app.schemas.subscription import PlanTier, PlanLimits, PlanResponse, UserSubscriptionStatus, resolve_plan_tier
from app.database.mongodb import db_manager


class SubscriptionService:
    """Multi-tier Subscription & Entitlement Service — FREE + GOLDEN launch."""

    PLANS: Dict[PlanTier, PlanResponse] = {
        PlanTier.FREE: PlanResponse(
            id=PlanTier.FREE,
            name="Free",
            description="Get started with essential career tools at no cost.",
            price_monthly=0.0,
            price_yearly=0.0,
            currency="INR",
            limits=PlanLimits(
                max_resumes=2,
                max_portfolios=1,
                monthly_ai_credits=30,
                daily_ai_credits_limit=20,
                custom_domains_allowed=0,
                allowed_templates=["modern_linear", "minimal", "google_style"],
                allowed_themes=["developer", "minimal"],
                analytics_level="basic",
                priority_support=False,
            ),
            features=[
                "30 AI Credits / month",
                "2 Active Resumes",
                "1 Public Portfolio",
                "3 Basic Resume Templates",
                "Standard Analytics",
            ],
        ),
        PlanTier.GOLDEN: PlanResponse(
            id=PlanTier.GOLDEN,
            name="Golden Membership",
            description="Unlock the full power of AI-driven career tools.",
            price_monthly=69.0,
            price_yearly=0.0,  # Monthly-only for this launch
            currency="INR",
            limits=PlanLimits(
                max_resumes=-1,  # Unlimited
                max_portfolios=5,
                monthly_ai_credits=100,
                daily_ai_credits_limit=20,
                custom_domains_allowed=0,
                allowed_templates=["all"],
                allowed_themes=["all"],
                analytics_level="advanced",
                priority_support=False,
            ),
            features=[
                "100 AI Credits / month",
                "Unlimited Resumes",
                "5 Public Portfolios",
                "All Resume Templates",
                "All Portfolio Themes",
                "AI Resume Enhancement",
                "ATS Analysis",
                "AI Cover Letter",
                "AI Interview Coach",
                "No advertisements",
                "Standard AI processing",
            ],
        ),
    }

    @classmethod
    def get_all_plans(cls) -> List[PlanResponse]:
        """Return list of all subscription plan tiers."""
        return list(cls.PLANS.values())

    @classmethod
    async def get_user_subscription(cls, user_id: str) -> UserSubscriptionStatus:
        """Fetch current user's subscription status & usage metrics."""
        db = db_manager.db
        user = await db["users"].find_one({"_id": user_id}) if db is not None else None

        # Resolve tier with backward-compat for legacy 'pro' / 'enterprise' values
        raw_tier = user.get("subscription_tier", "free") if user else "free"
        tier = resolve_plan_tier(raw_tier)
        plan = cls.PLANS.get(tier, cls.PLANS[PlanTier.FREE])

        # Calculate current usage counts
        resumes_count = await db["resumes"].count_documents({"user_id": user_id}) if db is not None else 0
        portfolios_count = await db["portfolios"].count_documents({"user_id": user_id}) if db is not None else 0

        ai_credits_used = user.get("ai_credits_used", 0) if user else 0
        ai_credits_remaining = max(0, plan.limits.monthly_ai_credits - ai_credits_used)

        # Daily usage for safety limit
        from datetime import datetime, timezone
        today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        daily_credits_used = 0
        if db is not None:
            daily_doc = await db["daily_ai_credits"].find_one({"user_id": user_id, "date": today_str})
            daily_credits_used = daily_doc.get("credits_used", 0) if daily_doc else 0

        return UserSubscriptionStatus(
            tier=tier,
            status=user.get("subscription_status", "active") if user else "active",
            current_period_start=user.get("current_period_start"),
            current_period_end=user.get("current_period_end"),
            cancel_at_period_end=user.get("cancel_at_period_end", False) if user else False,
            razorpay_subscription_id=user.get("razorpay_subscription_id"),
            ai_credits_remaining=ai_credits_remaining,
            ai_credits_limit=plan.limits.monthly_ai_credits,
            daily_credits_used=daily_credits_used,
            daily_credits_limit=plan.limits.daily_ai_credits_limit,
            resumes_count=resumes_count,
            resumes_limit=plan.limits.max_resumes,
            portfolios_count=portfolios_count,
            portfolios_limit=plan.limits.max_portfolios,
            custom_domains_count=user.get("custom_domains_count", 0) if user else 0,
            custom_domains_limit=plan.limits.custom_domains_allowed,
        )
