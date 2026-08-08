from fastapi import APIRouter, Depends, Body
from typing import List, Dict, Any
from app.schemas.response import APIResponse
from app.models.content import PortfolioPost
from app.services.content_studio_service import ContentStudioService
from app.security.dependencies import get_current_user

router = APIRouter()


def get_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("id") or user.get("_id") or "")
    return str(getattr(user, "id", getattr(user, "_id", "")))


@router.get("", response_model=APIResponse[List[Dict[str, Any]]])
async def get_posts(current_user: dict = Depends(get_current_user)):
    user_id = get_user_id(current_user)
    posts = await ContentStudioService.get_posts(user_id)
    return APIResponse.ok(data=posts)


@router.post("", response_model=APIResponse[PortfolioPost])
async def save_post(
    post_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = get_user_id(current_user)
    post = await ContentStudioService.save_post(user_id, post_data)
    return APIResponse.ok(data=post)


@router.post("/generate", response_model=APIResponse[str])
async def generate_post(
    topic: str = Body(..., embed=True),
    platform: str = Body(..., embed=True),
    tone: str = Body("professional", embed=True),
    current_user: dict = Depends(get_current_user)
):
    user_id = get_user_id(current_user)
    content = await ContentStudioService.generate_post(user_id, topic, platform, tone)
    return APIResponse.ok(data=content)
