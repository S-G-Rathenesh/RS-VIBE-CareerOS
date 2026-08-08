from datetime import datetime, timezone
from typing import List
from pydantic import BaseModel
from app.database.mongodb import db_manager


class ActivityItem(BaseModel):
    id: str
    user_id: str
    action: str  # "resume_created", "resume_edited", "portfolio_published", "ai_used", "resume_shared", "payment", "login"
    description: str
    metadata: dict
    timestamp: str


class ActivityService:
    """User Activity Timeline Tracking Service."""

    @classmethod
    async def log_activity(cls, user_id: str, action: str, description: str, metadata: dict = {}) -> None:
        """Record a user activity event."""
        db = db_manager.db
        if db is not None:
            doc = {
                "user_id": user_id,
                "action": action,
                "description": description,
                "metadata": metadata,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            await db["activity_timeline"].insert_one(doc)

    @classmethod
    async def get_timeline(cls, user_id: str, limit: int = 50) -> List[ActivityItem]:
        """Fetch user activity timeline ordered by newest first."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["activity_timeline"].find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
        docs = await cursor.to_list(length=limit)

        return [
            ActivityItem(
                id=str(doc.get("_id")),
                user_id=doc.get("user_id", ""),
                action=doc.get("action", ""),
                description=doc.get("description", ""),
                metadata=doc.get("metadata", {}),
                timestamp=doc.get("timestamp", "")
            )
            for doc in docs
        ]
