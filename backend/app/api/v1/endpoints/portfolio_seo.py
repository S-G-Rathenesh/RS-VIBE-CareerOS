from fastapi import APIRouter, Depends, Body
from typing import Dict, Any
from app.schemas.response import APIResponse
from app.models.seo import SEOProfile
from app.services.seo_optimizer_service import SEOOptimizerService
from app.security.dependencies import get_current_user

router = APIRouter()


def get_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("id") or user.get("_id") or "")
    return str(getattr(user, "id", getattr(user, "_id", "")))


@router.get("/{portfolio_id}", response_model=APIResponse)
async def get_seo_profile(portfolio_id: str, current_user: dict = Depends(get_current_user)):
    profile = await SEOOptimizerService.get_seo_profile(portfolio_id)
    return APIResponse.ok(data=profile)


@router.put("/{portfolio_id}", response_model=APIResponse[SEOProfile])
async def save_seo_profile(
    portfolio_id: str,
    seo_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = get_user_id(current_user)
    profile = await SEOOptimizerService.save_seo_profile(user_id, portfolio_id, seo_data)
    return APIResponse.ok(data=profile)


@router.post("/{portfolio_id}/generate", response_model=APIResponse[Dict[str, Any]])
async def generate_seo_profile(
    portfolio_id: str,
    context: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user)
):
    user_id = get_user_id(current_user)
    assets = await SEOOptimizerService.generate_seo_profile(user_id, portfolio_id, context)
    return APIResponse.ok(data=assets)
