from fastapi import APIRouter, Depends, UploadFile, File
from typing import Any
from app.schemas.response import APIResponse
from app.schemas.user import UserResponse, UserUpdate
from app.services.user_service import UserService
from app.providers.storage import get_storage_provider
from app.security.dependencies import get_current_user
from app.core.exceptions import APIException
from app.core.logging import logger

router = APIRouter()


def get_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("id") or user.get("_id") or "")
    return str(getattr(user, "id", getattr(user, "_id", "")))


@router.get("/me", response_model=APIResponse[UserResponse])
async def get_me(current_user: dict = Depends(get_current_user)):
    """Fetch current user profile."""
    return APIResponse.ok(data=current_user)


@router.put("/me", response_model=APIResponse[UserResponse])
async def update_me(
    data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update profile fields."""
    user_id = get_user_id(current_user)
    updated = await UserService.update_user(user_id, data)
    return APIResponse.ok(data=updated)


@router.post("/avatar", response_model=APIResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload profile picture to Cloudinary 'exploreme_ai/avatars' folder with 2MB limit,
    JPG/PNG/WEBP validation, 400x400 auto-crop, and delete previous Cloudinary avatar.
    """
    user_id = get_user_id(current_user)
    storage = get_storage_provider()
    contents = await file.read()

    # Validate file format & file size (2MB cap)
    content_type = file.content_type or "image/jpeg"
    storage.validate_image_file(content_type, len(contents), category="avatar")

    # Delete previous Cloudinary image if user already had an avatar
    if current_user.get("avatar_public_id"):
        await storage.delete_image(current_user["avatar_public_id"])

    # Upload to Cloudinary
    upload_res = await storage.upload_image(
        contents,
        category="avatar",
        content_type=content_type
    )
    logger.info(f"[Avatar Diagnostic 1 - Cloudinary Upload Result] url={upload_res.get('url')}, public_id={upload_res.get('public_id')}")

    # Update MongoDB user record
    update_data = UserUpdate(
        avatar_url=upload_res["url"],
        avatar_public_id=upload_res["public_id"]
    )
    updated_user = await UserService.update_user(user_id, update_data)

    response_payload = {
        "avatar_url": upload_res["url"],
        "avatar_public_id": upload_res["public_id"],
        "thumbnail_url": upload_res.get("thumbnail_url"),
        "user": updated_user
    }
    logger.info(f"[Avatar Diagnostic 3 - API Response Payload] {response_payload}")

    return APIResponse.ok(data=response_payload)


@router.delete("/avatar", response_model=APIResponse)
async def delete_avatar(current_user: dict = Depends(get_current_user)):
    """Remove avatar from Cloudinary and clear user record in MongoDB."""
    user_id = get_user_id(current_user)
    updated_user = await UserService.remove_avatar(user_id)
    return APIResponse.ok(data={"message": "Avatar deleted", "user": updated_user})
