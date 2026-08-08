from fastapi import APIRouter, Depends, Body
from typing import Dict, Any
from app.schemas.response import APIResponse
from app.models.brand import BrandProfile
from app.services.brand_service import BrandService
from app.security.dependencies import get_current_user

router = APIRouter()


def get_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("id") or user.get("_id") or "")
    return str(getattr(user, "id", getattr(user, "_id", "")))


@router.get("", response_model=APIResponse[BrandProfile])
async def get_brand_profile(current_user: dict = Depends(get_current_user)):
    user_id = get_user_id(current_user)
    profile = await BrandService.get_brand_profile(user_id)
    return APIResponse.ok(data=profile)


@router.put("", response_model=APIResponse[BrandProfile])
async def save_brand_profile(
    profile_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = get_user_id(current_user)
    profile = await BrandService.save_brand_profile(user_id, profile_data)
    return APIResponse.ok(data=profile)


@router.post("/generate", response_model=APIResponse[Dict[str, str]])
async def generate_brand_assets(
    context: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user)
):
    user_id = get_user_id(current_user)
    assets = await BrandService.generate_brand_assets(user_id, context)
    return APIResponse.ok(data=assets)
