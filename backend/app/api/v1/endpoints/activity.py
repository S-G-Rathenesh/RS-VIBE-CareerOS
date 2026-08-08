from fastapi import APIRouter, Depends
from typing import List
from app.schemas.response import APIResponse
from app.services.activity_service import ActivityItem, ActivityService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=APIResponse[List[ActivityItem]])
async def get_activity_timeline(current_user: dict = Depends(get_current_user)):
    """Fetch user activity timeline."""
    timeline = await ActivityService.get_timeline(current_user["id"])
    return APIResponse.ok(data=timeline)
