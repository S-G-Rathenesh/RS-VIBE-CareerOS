from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel
from app.database.mongodb import db_manager


class FeatureFlagItem(BaseModel):
    id: str
    key: str  # e.g., "ai_interview_v2", "team_analytics_beta"
    name: str
    description: str
    enabled: bool
    scope: str  # "global", "user", "organization"
    target_ids: List[str]  # user_ids or org_ids (empty for global)
    created_at: str


class FeatureFlagService:
    """Dynamic Feature Flag Engine for rollout control, beta testing, and enterprise gating."""

    @classmethod
    async def create_flag(cls, key: str, name: str, description: str, enabled: bool = False, scope: str = "global", target_ids: List[str] = []) -> FeatureFlagItem:
        """Create a new feature flag."""
        db = db_manager.db
        if db is None:
            return FeatureFlagItem(id="", key=key, name=name, description=description, enabled=enabled, scope=scope, target_ids=target_ids, created_at="")

        doc = {
            "key": key,
            "name": name,
            "description": description,
            "enabled": enabled,
            "scope": scope,
            "target_ids": target_ids,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        res = await db["feature_flags"].insert_one(doc)

        return FeatureFlagItem(
            id=str(res.inserted_id),
            key=key, name=name, description=description,
            enabled=enabled, scope=scope, target_ids=target_ids,
            created_at=doc["created_at"]
        )

    @classmethod
    async def is_enabled(cls, key: str, user_id: Optional[str] = None, org_id: Optional[str] = None) -> bool:
        """Check if a feature flag is enabled for a given context."""
        db = db_manager.db
        if db is None:
            return False

        flag = await db["feature_flags"].find_one({"key": key})
        if not flag:
            return False
        if not flag.get("enabled", False):
            return False

        scope = flag.get("scope", "global")
        if scope == "global":
            return True
        elif scope == "user" and user_id:
            return user_id in flag.get("target_ids", [])
        elif scope == "organization" and org_id:
            return org_id in flag.get("target_ids", [])

        return False

    @classmethod
    async def get_all_flags(cls) -> List[FeatureFlagItem]:
        """List all feature flags."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["feature_flags"].find().sort("created_at", -1)
        docs = await cursor.to_list(length=200)

        return [
            FeatureFlagItem(
                id=str(doc.get("_id")),
                key=doc.get("key", ""),
                name=doc.get("name", ""),
                description=doc.get("description", ""),
                enabled=doc.get("enabled", False),
                scope=doc.get("scope", "global"),
                target_ids=doc.get("target_ids", []),
                created_at=doc.get("created_at", "")
            )
            for doc in docs
        ]

    @classmethod
    async def toggle_flag(cls, flag_id: str, enabled: bool) -> bool:
        """Enable or disable a feature flag."""
        db = db_manager.db
        if db is not None:
            await db["feature_flags"].update_one(
                {"_id": flag_id},
                {"$set": {"enabled": enabled}}
            )
        return True
