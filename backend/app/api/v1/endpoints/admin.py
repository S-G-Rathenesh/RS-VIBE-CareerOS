from fastapi import APIRouter, Depends, Body
from app.schemas.response import APIResponse
from app.schemas.admin import AdminAnalyticsResponse
from app.services.admin_service import AdminService
from app.security.dependencies import get_current_admin_user

router = APIRouter()


@router.get("/analytics", response_model=APIResponse[AdminAnalyticsResponse])
async def get_admin_analytics(admin_user: dict = Depends(get_current_admin_user)):
    """Fetch global platform metrics and user management table."""
    analytics = await AdminService.get_analytics()
    return APIResponse.ok(data=analytics)


@router.put("/users/{user_id}/role", response_model=APIResponse)
async def update_user_role(
    user_id: str,
    role: str = Body(..., embed=True),
    admin_user: dict = Depends(get_current_admin_user)
):
    """Update user role (user <-> admin)."""
    await AdminService.update_user_role(user_id, role)
    return APIResponse.ok(data={"message": f"User role updated to '{role}'."})


@router.delete("/users/{user_id}", response_model=APIResponse)
async def delete_user(
    user_id: str,
    admin_user: dict = Depends(get_current_admin_user)
):
    """Delete a user and clean up associated documents."""
    await AdminService.delete_user(user_id)
    return APIResponse.ok(data={"message": "User deleted successfully."})
