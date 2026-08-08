from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.response import APIResponse
from app.schemas.domain import AddDomainRequest, CustomDomainItem, VerifyDomainResponse
from app.services.domain_service import DomainService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=APIResponse[List[CustomDomainItem]])
async def get_my_domains(current_user: dict = Depends(get_current_user)):
    """Fetch user's registered custom domains."""
    domains = await DomainService.get_user_domains(current_user["id"])
    return APIResponse.ok(data=domains)


@router.post("/add", response_model=APIResponse[CustomDomainItem], status_code=status.HTTP_201_CREATED)
async def add_domain(
    data: AddDomainRequest,
    current_user: dict = Depends(get_current_user)
):
    """Add custom domain mapping for a portfolio."""
    domain_item = await DomainService.add_custom_domain(current_user["id"], data)
    return APIResponse.ok(data=domain_item)


@router.post("/{domain_id}/verify", response_model=APIResponse[VerifyDomainResponse])
async def verify_domain(
    domain_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Verify live DNS CNAME resolution and SSL status."""
    res = await DomainService.verify_custom_domain(current_user["id"], domain_id)
    return APIResponse.ok(data=res)


@router.delete("/{domain_id}", response_model=APIResponse)
async def delete_domain(
    domain_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove custom domain record."""
    await DomainService.delete_custom_domain(current_user["id"], domain_id)
    return APIResponse.ok(data={"message": "Custom domain record removed."})
