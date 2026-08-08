from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.response import APIResponse
from app.schemas.organization import (
    CreateOrganizationRequest, InviteMemberRequest,
    OrganizationItem, OrgMemberItem, OrgInviteItem
)
from app.services.organization_service import OrganizationService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=APIResponse[List[OrganizationItem]])
async def get_my_organizations(current_user: dict = Depends(get_current_user)):
    """Fetch user's team workspaces."""
    orgs = await OrganizationService.get_user_organizations(current_user["id"])
    return APIResponse.ok(data=orgs)


@router.post("", response_model=APIResponse[OrganizationItem], status_code=status.HTTP_201_CREATED)
async def create_organization(
    data: CreateOrganizationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new team workspace organization."""
    org = await OrganizationService.create_organization(
        owner_id=current_user["id"],
        owner_email=current_user["email"],
        request=data
    )
    return APIResponse.ok(data=org)


@router.get("/{org_id}/members", response_model=APIResponse[List[OrgMemberItem]])
async def get_org_members(
    org_id: str,
    current_user: dict = Depends(get_current_user)
):
    """List organization team members."""
    members = await OrganizationService.get_org_members(org_id)
    return APIResponse.ok(data=members)


@router.post("/{org_id}/invite", response_model=APIResponse[OrgInviteItem])
async def invite_member(
    org_id: str,
    data: InviteMemberRequest,
    current_user: dict = Depends(get_current_user)
):
    """Invite a user to the organization by email."""
    invite = await OrganizationService.invite_member(org_id, current_user["id"], data)
    return APIResponse.ok(data=invite)


@router.post("/invites/{invite_id}/accept", response_model=APIResponse)
async def accept_invite(
    invite_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Accept an organization invitation."""
    await OrganizationService.accept_invite(current_user["id"], current_user["email"], invite_id)
    return APIResponse.ok(data={"message": "Invitation accepted. You are now a team member."})


@router.delete("/{org_id}/members/{member_user_id}", response_model=APIResponse)
async def remove_member(
    org_id: str,
    member_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove a member from the organization."""
    await OrganizationService.remove_member(org_id, current_user["id"], member_user_id)
    return APIResponse.ok(data={"message": "Member removed from organization."})
