from fastapi import APIRouter, Depends, Body
from typing import Dict, Any
from app.schemas.response import APIResponse
from app.models.brand import BrandingScore
from app.services.brand_assistant_service import BrandAssistantService
from app.security.dependencies import get_current_user

router = APIRouter()


def get_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("id") or user.get("_id") or "")
    return str(getattr(user, "id", getattr(user, "_id", "")))


@router.get("", response_model=APIResponse)
async def get_latest_branding_score(current_user: dict = Depends(get_current_user)):
    user_id = get_user_id(current_user)
    score = await BrandAssistantService.get_latest_score(user_id)
    return APIResponse.ok(data=score)


@router.post("/evaluate", response_model=APIResponse[BrandingScore])
async def evaluate_brand(
    context: str = Body(..., embed=True),
    current_user: dict = Depends(get_current_user)
):
    user_id = get_user_id(current_user)
    score = await BrandAssistantService.evaluate_brand(user_id, context)
    return APIResponse.ok(data=score)
