from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from app.schemas.response import APIResponse
from app.services.feature_flag_service import FeatureFlagItem, FeatureFlagService
from app.security.dependencies import get_current_user

router = APIRouter()


class CreateFlagRequest(BaseModel):
    key: str
    name: str
    description: str
    enabled: bool = False
    scope: str = "global"
    target_ids: List[str] = []


class ToggleFlagRequest(BaseModel):
    enabled: bool


@router.get("", response_model=APIResponse[List[FeatureFlagItem]])
async def get_feature_flags(current_user: dict = Depends(get_current_user)):
    """List all feature flags."""
    flags = await FeatureFlagService.get_all_flags()
    return APIResponse.ok(data=flags)


@router.post("", response_model=APIResponse[FeatureFlagItem])
async def create_feature_flag(
    data: CreateFlagRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new feature flag."""
    flag = await FeatureFlagService.create_flag(
        key=data.key, name=data.name, description=data.description,
        enabled=data.enabled, scope=data.scope, target_ids=data.target_ids
    )
    return APIResponse.ok(data=flag)


@router.put("/{flag_id}/toggle", response_model=APIResponse)
async def toggle_feature_flag(
    flag_id: str,
    data: ToggleFlagRequest,
    current_user: dict = Depends(get_current_user)
):
    """Enable or disable a feature flag."""
    await FeatureFlagService.toggle_flag(flag_id, data.enabled)
    return APIResponse.ok(data={"message": f"Flag {'enabled' if data.enabled else 'disabled'}."})
