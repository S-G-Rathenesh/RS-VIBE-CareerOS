from fastapi import APIRouter, Depends
from typing import List
from app.schemas.response import APIResponse
from app.schemas.subscription import PlanResponse, UserSubscriptionStatus
from app.services.subscription_service import SubscriptionService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.get("/plans", response_model=APIResponse[List[PlanResponse]])
async def get_plans():
    """Fetch all available subscription plans & tier limits."""
    plans = SubscriptionService.get_all_plans()
    return APIResponse.ok(data=plans)


@router.get("/me", response_model=APIResponse[UserSubscriptionStatus])
async def get_my_subscription(current_user: dict = Depends(get_current_user)):
    """Fetch current user's subscription status, AI credits, and active usage meters."""
    status = await SubscriptionService.get_user_subscription(current_user["id"])
    return APIResponse.ok(data=status)
