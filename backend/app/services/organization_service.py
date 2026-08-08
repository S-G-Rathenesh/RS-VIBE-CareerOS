from datetime import datetime, timezone
from typing import List, Optional
from app.schemas.organization import (
    CreateOrganizationRequest, InviteMemberRequest,
    OrganizationItem, OrgMemberItem, OrgInviteItem, OrgRole
)
from app.database.mongodb import db_manager
from app.core.exceptions import APIException


class OrganizationService:
    """Multi-tenant Team Workspace & Permission Management Service."""

    @classmethod
    async def create_organization(cls, owner_id: str, owner_email: str, request: CreateOrganizationRequest) -> OrganizationItem:
        """Create a new team workspace organization."""
        db = db_manager.db
        if db is None:
            raise APIException(status_code=500, message="Database unavailable.")

        org_doc = {
            "name": request.name,
            "description": request.description or "",
            "owner_id": owner_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        res = await db["organizations"].insert_one(org_doc)
        org_id = str(res.inserted_id)

        # Insert owner as first member
        member_doc = {
            "org_id": org_id,
            "user_id": owner_id,
            "email": owner_email,
            "role": OrgRole.OWNER.value,
            "joined_at": datetime.now(timezone.utc).isoformat()
        }
        await db["org_members"].insert_one(member_doc)

        return OrganizationItem(
            id=org_id,
            name=org_doc["name"],
            description=org_doc["description"],
            owner_id=owner_id,
            member_count=1,
            created_at=org_doc["created_at"]
        )

    @classmethod
    async def get_user_organizations(cls, user_id: str) -> List[OrganizationItem]:
        """Fetch all organizations a user belongs to."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["org_members"].find({"user_id": user_id})
        memberships = await cursor.to_list(length=50)
        org_ids = [m["org_id"] for m in memberships]

        orgs = []
        for org_id in org_ids:
            org = await db["organizations"].find_one({"_id": org_id})
            if org:
                member_count = await db["org_members"].count_documents({"org_id": org_id})
                orgs.append(OrganizationItem(
                    id=str(org["_id"]),
                    name=org.get("name", ""),
                    description=org.get("description", ""),
                    owner_id=org.get("owner_id", ""),
                    member_count=member_count,
                    created_at=org.get("created_at", "")
                ))
        return orgs

    @classmethod
    async def invite_member(cls, org_id: str, inviter_id: str, request: InviteMemberRequest) -> OrgInviteItem:
        """Invite a user to the organization by email."""
        db = db_manager.db
        if db is None:
            raise APIException(status_code=500, message="Database unavailable.")

        # Check inviter has admin or owner role
        inviter_membership = await db["org_members"].find_one({"org_id": org_id, "user_id": inviter_id})
        if not inviter_membership or inviter_membership.get("role") not in ["owner", "admin"]:
            raise APIException(status_code=403, message="Only owners and admins can invite new members.")

        org = await db["organizations"].find_one({"_id": org_id})
        if not org:
            raise APIException(status_code=404, message="Organization not found.")

        # Check if already invited
        existing = await db["org_invites"].find_one({"org_id": org_id, "email": request.email, "status": "pending"})
        if existing:
            raise APIException(status_code=400, message=f"Invitation already pending for {request.email}.")

        invite_doc = {
            "org_id": org_id,
            "org_name": org.get("name", ""),
            "email": request.email,
            "role": request.role.value,
            "status": "pending",
            "invited_by": inviter_id,
            "invited_at": datetime.now(timezone.utc).isoformat()
        }
        res = await db["org_invites"].insert_one(invite_doc)

        return OrgInviteItem(
            id=str(res.inserted_id),
            org_id=org_id,
            org_name=invite_doc["org_name"],
            email=request.email,
            role=request.role,
            status="pending",
            invited_at=invite_doc["invited_at"]
        )

    @classmethod
    async def accept_invite(cls, user_id: str, user_email: str, invite_id: str) -> bool:
        """Accept a team workspace invitation."""
        db = db_manager.db
        if db is None:
            raise APIException(status_code=500, message="Database unavailable.")

        invite = await db["org_invites"].find_one({"_id": invite_id, "email": user_email, "status": "pending"})
        if not invite:
            raise APIException(status_code=404, message="Invite not found or already processed.")

        # Add user as member
        member_doc = {
            "org_id": invite["org_id"],
            "user_id": user_id,
            "email": user_email,
            "role": invite.get("role", "member"),
            "joined_at": datetime.now(timezone.utc).isoformat()
        }
        await db["org_members"].insert_one(member_doc)

        # Update invite status
        await db["org_invites"].update_one(
            {"_id": invite_id},
            {"$set": {"status": "accepted"}}
        )
        return True

    @classmethod
    async def get_org_members(cls, org_id: str) -> List[OrgMemberItem]:
        """List all members of an organization."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["org_members"].find({"org_id": org_id})
        docs = await cursor.to_list(length=200)

        members = []
        for doc in docs:
            user = await db["users"].find_one({"_id": doc["user_id"]}) if db is not None else None
            members.append(OrgMemberItem(
                id=str(doc.get("_id")),
                user_id=doc.get("user_id", ""),
                email=doc.get("email", ""),
                full_name=user.get("full_name", "") if user else "",
                role=OrgRole(doc.get("role", "member")),
                avatar_url=user.get("avatar_url") if user else None,
                joined_at=doc.get("joined_at", "")
            ))
        return members

    @classmethod
    async def remove_member(cls, org_id: str, remover_id: str, member_user_id: str) -> bool:
        """Remove a member from the organization."""
        db = db_manager.db
        if db is None:
            raise APIException(status_code=500, message="Database unavailable.")

        remover = await db["org_members"].find_one({"org_id": org_id, "user_id": remover_id})
        if not remover or remover.get("role") not in ["owner", "admin"]:
            raise APIException(status_code=403, message="Only owners and admins can remove members.")

        await db["org_members"].delete_one({"org_id": org_id, "user_id": member_user_id})
        return True
