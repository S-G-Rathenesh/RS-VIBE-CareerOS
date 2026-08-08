from fastapi import APIRouter, Depends, Body
from typing import List, Dict, Any
from app.schemas.response import APIResponse
from app.services.portfolio_cms_service import PortfolioCMSService
from app.security.dependencies import get_current_user

router = APIRouter()


def get_user_id(user: Any) -> str:
    if isinstance(user, dict):
        return str(user.get("id") or user.get("_id") or "")
    return str(getattr(user, "id", getattr(user, "_id", "")))


@router.get("/{portfolio_id}/versions", response_model=APIResponse[List[Dict[str, Any]]])
async def get_portfolio_versions(
    portfolio_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = get_user_id(current_user)
    versions = await PortfolioCMSService.get_versions(user_id, portfolio_id)
    return APIResponse.ok(data=versions)


@router.post("/{portfolio_id}/versions", response_model=APIResponse[str])
async def create_portfolio_version(
    portfolio_id: str,
    version_name: str = Body(..., embed=True),
    portfolio_data: dict = Body(..., embed=True),
    status: str = Body("draft", embed=True),
    current_user: dict = Depends(get_current_user)
):
    user_id = get_user_id(current_user)
    version_id = await PortfolioCMSService.create_version(
        user_id, portfolio_id, version_name, portfolio_data, status
    )
    return APIResponse.ok(data=version_id)


@router.post("/{portfolio_id}/versions/{version_id}/publish", response_model=APIResponse[bool])
async def publish_portfolio_version(
    portfolio_id: str,
    version_id: str,
    current_user: dict = Depends(get_current_user)
):
    user_id = get_user_id(current_user)
    success = await PortfolioCMSService.publish_version(user_id, portfolio_id, version_id)
    return APIResponse.ok(data=success)
