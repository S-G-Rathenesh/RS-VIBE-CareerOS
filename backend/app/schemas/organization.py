from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class OrgRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"


class CreateOrganizationRequest(BaseModel):
    name: str
    description: Optional[str] = ""


class InviteMemberRequest(BaseModel):
    email: str
    role: OrgRole = OrgRole.MEMBER


class OrganizationItem(BaseModel):
    id: str
    name: str
    description: str
    owner_id: str
    member_count: int
    created_at: str


class OrgMemberItem(BaseModel):
    id: str
    user_id: str
    email: str
    full_name: str
    role: OrgRole
    avatar_url: Optional[str] = None
    joined_at: str


class OrgInviteItem(BaseModel):
    id: str
    org_id: str
    org_name: str
    email: str
    role: OrgRole
    status: str  # "pending", "accepted", "rejected"
    invited_at: str
