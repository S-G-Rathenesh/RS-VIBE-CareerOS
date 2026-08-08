from fastapi import APIRouter, Depends
from typing import List
from pydantic import BaseModel
from app.schemas.response import APIResponse
from app.services.apikey_service import APIKeyItem, APIKeyService
from app.security.dependencies import get_current_user


router = APIRouter()


class CreateAPIKeyRequest(BaseModel):
    name: str
    scopes: List[str] = ["read"]


@router.get("", response_model=APIResponse[List[APIKeyItem]])
async def get_api_keys(current_user: dict = Depends(get_current_user)):
    """List all API keys for user."""
    keys = await APIKeyService.get_user_keys(current_user["id"])
    return APIResponse.ok(data=keys)


@router.post("", response_model=APIResponse)
async def create_api_key(
    data: CreateAPIKeyRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate a new API key. Key is revealed ONCE on creation."""
    result = await APIKeyService.generate_api_key(current_user["id"], data.name, data.scopes)
    return APIResponse.ok(data=result)


@router.delete("/{key_id}", response_model=APIResponse)
async def revoke_api_key(
    key_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Revoke and permanently delete an API key."""
    await APIKeyService.revoke_api_key(current_user["id"], key_id)
    return APIResponse.ok(data={"message": "API key revoked."})
