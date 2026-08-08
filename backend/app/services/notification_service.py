from datetime import datetime, timezone
from typing import List
from app.schemas.notification import NotificationItem
from app.database.mongodb import db_manager


class NotificationService:
    """In-app Notification Center Service."""

    @classmethod
    async def create_notification(
        cls,
        user_id: str,
        notification_type: str,
        title: str,
        message: str,
        link: str = ""
    ) -> NotificationItem:
        """Create a new notification for a user."""
        db = db_manager.db
        if db is None:
            return NotificationItem(
                id="", user_id=user_id, type=notification_type,
                title=title, message=message, read=False, link=link, created_at=""
            )

        doc = {
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "read": False,
            "link": link,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        res = await db["notifications"].insert_one(doc)

        return NotificationItem(
            id=str(res.inserted_id),
            user_id=user_id,
            type=notification_type,
            title=title,
            message=message,
            read=False,
            link=link,
            created_at=doc["created_at"]
        )

    @classmethod
    async def get_notifications(cls, user_id: str, limit: int = 50) -> List[NotificationItem]:
        """Fetch user notifications ordered by newest first."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["notifications"].find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        docs = await cursor.to_list(length=limit)

        return [
            NotificationItem(
                id=str(doc.get("_id")),
                user_id=doc.get("user_id", ""),
                type=doc.get("type", "system_alert"),
                title=doc.get("title", ""),
                message=doc.get("message", ""),
                read=doc.get("read", False),
                link=doc.get("link"),
                created_at=doc.get("created_at", "")
            )
            for doc in docs
        ]

    @classmethod
    async def get_unread_count(cls, user_id: str) -> int:
        """Count unread notifications."""
        db = db_manager.db
        if db is None:
            return 0
        return await db["notifications"].count_documents({"user_id": user_id, "read": False})

    @classmethod
    async def mark_as_read(cls, user_id: str, notification_id: str) -> bool:
        """Mark a single notification as read."""
        db = db_manager.db
        if db is not None:
            await db["notifications"].update_one(
                {"_id": notification_id, "user_id": user_id},
                {"$set": {"read": True}}
            )
        return True

    @classmethod
    async def mark_all_read(cls, user_id: str) -> bool:
        """Mark all notifications as read for a user."""
        db = db_manager.db
        if db is not None:
            await db["notifications"].update_many(
                {"user_id": user_id, "read": False},
                {"$set": {"read": True}}
            )
        return True
