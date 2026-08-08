from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class PlanTier(str, Enum):
    FREE = "free"
    GOLDEN = "golden"


# Legacy tier aliases — used for backward-compatible DB lookups
_LEGACY_TIER_MAP = {
    "pro": PlanTier.GOLDEN,
    "enterprise": PlanTier.GOLDEN,
}


def resolve_plan_tier(raw: str) -> PlanTier:
    """Convert a raw DB string to PlanTier, mapping legacy values to GOLDEN."""
    raw_lower = (raw or "free").strip().lower()
    if raw_lower in _LEGACY_TIER_MAP:
        return _LEGACY_TIER_MAP[raw_lower]
    try:
        return PlanTier(raw_lower)
    except ValueError:
        return PlanTier.FREE


class PlanLimits(BaseModel):
    max_resumes: int  # -1 for unlimited
    max_portfolios: int  # -1 for unlimited
    monthly_ai_credits: int
    daily_ai_credits_limit: int = 20  # Safety limit per day
    custom_domains_allowed: int
    allowed_templates: List[str]
    allowed_themes: List[str]
    analytics_level: str  # "basic", "advanced", "executive"
    priority_support: bool


class PlanResponse(BaseModel):
    id: PlanTier
    name: str
    description: str
    price_monthly: float
    price_yearly: float
    currency: str = "INR"
    limits: PlanLimits
    features: List[str]


class UserSubscriptionStatus(BaseModel):
    tier: PlanTier
    status: str  # "active", "canceled", "past_due"
    current_period_start: Optional[str] = None
    current_period_end: Optional[str] = None
    cancel_at_period_end: bool = False
    razorpay_subscription_id: Optional[str] = None
    ai_credits_remaining: int
    ai_credits_limit: int
    daily_credits_used: int = 0
    daily_credits_limit: int = 20
    resumes_count: int
    resumes_limit: int
    portfolios_count: int
    portfolios_limit: int
    custom_domains_count: int
    custom_domains_limit: int
