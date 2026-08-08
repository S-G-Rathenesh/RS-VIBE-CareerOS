from fastapi import Depends
from app.security.dependencies import get_current_user
from app.services.subscription_service import SubscriptionService
from app.core.exceptions import APIException


async def check_resume_quota(current_user: dict = Depends(get_current_user)):
    """Security dependency checking resume creation limits."""
    status = await SubscriptionService.get_user_subscription(current_user["id"])
    if status.resumes_limit != -1 and status.resumes_count >= status.resumes_limit:
        raise APIException(
            status_code=403,
            message=f"Resume limit reached for your '{status.tier.value.upper()}' plan. Please upgrade to Pro for unlimited resumes."
        )
    return status


async def check_portfolio_quota(current_user: dict = Depends(get_current_user)):
    """Security dependency checking portfolio creation limits."""
    status = await SubscriptionService.get_user_subscription(current_user["id"])
    if status.portfolios_limit != -1 and status.portfolios_count >= status.portfolios_limit:
        raise APIException(
            status_code=403,
            message=f"Portfolio limit reached for your '{status.tier.value.upper()}' plan. Please upgrade to Pro or Enterprise for more portfolio sites."
        )
    return status


async def check_ai_credits_quota(credits_required: int = 10):
    """Factory dependency checking AI credit balance before LLM execution."""
    async def dependency(current_user: dict = Depends(get_current_user)):
        status = await SubscriptionService.get_user_subscription(current_user["id"])
        if status.ai_credits_remaining < credits_required:
            raise APIException(
                status_code=402,
                message=f"Insufficient AI Credits. This action requires {credits_required} credits, but you have {status.ai_credits_remaining} remaining. Please upgrade your plan."
            )
        return status
    return dependency
