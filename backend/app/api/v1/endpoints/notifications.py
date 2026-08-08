from fastapi import APIRouter, Depends
from typing import List
from app.schemas.response import APIResponse
from app.schemas.notification import NotificationItem
from app.services.notification_service import NotificationService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=APIResponse[List[NotificationItem]])
async def get_notifications(current_user: dict = Depends(get_current_user)):
    """Fetch user notifications."""
    notifications = await NotificationService.get_notifications(current_user["id"])
    return APIResponse.ok(data=notifications)


@router.get("/unread-count", response_model=APIResponse)
async def get_unread_count(current_user: dict = Depends(get_current_user)):
    """Get unread notification count for badge display."""
    count = await NotificationService.get_unread_count(current_user["id"])
    return APIResponse.ok(data={"unread_count": count})


@router.put("/{notification_id}/read", response_model=APIResponse)
async def mark_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Mark a notification as read."""
    await NotificationService.mark_as_read(current_user["id"], notification_id)
    return APIResponse.ok(data={"message": "Notification marked as read."})


@router.put("/read-all", response_model=APIResponse)
async def mark_all_read(current_user: dict = Depends(get_current_user)):
    """Mark all notifications as read."""
    await NotificationService.mark_all_read(current_user["id"])
    return APIResponse.ok(data={"message": "All notifications marked as read."})
