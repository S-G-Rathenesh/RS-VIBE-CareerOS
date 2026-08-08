from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel
from app.database.mongodb import db_manager


class AuditLogItem(BaseModel):
    id: str
    user_id: str
    action: str  # "auth.login", "auth.register", "admin.role_change", "payment.success", "upload.avatar", "ai.analysis", "portfolio.publish"
    resource_type: str
    resource_id: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: dict
    timestamp: str


class AuditLogService:
    """System-wide Compliance Audit Log Engine."""

    @classmethod
    async def log(
        cls,
        user_id: str,
        action: str,
        resource_type: str,
        resource_id: str = "",
        ip_address: str = "",
        user_agent: str = "",
        details: dict = {}
    ) -> None:
        """Record a compliance audit log entry."""
        db = db_manager.db
        if db is not None:
            doc = {
                "user_id": user_id,
                "action": action,
                "resource_type": resource_type,
                "resource_id": resource_id,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "details": details,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            await db["audit_logs"].insert_one(doc)

    @classmethod
    async def get_logs(cls, user_id: Optional[str] = None, limit: int = 100) -> List[AuditLogItem]:
        """Fetch audit logs. If user_id provided, filter by user."""
        db = db_manager.db
        if db is None:
            return []

        query = {"user_id": user_id} if user_id else {}
        cursor = db["audit_logs"].find(query).sort("timestamp", -1).limit(limit)
        docs = await cursor.to_list(length=limit)

        return [
            AuditLogItem(
                id=str(doc.get("_id")),
                user_id=doc.get("user_id", ""),
                action=doc.get("action", ""),
                resource_type=doc.get("resource_type", ""),
                resource_id=doc.get("resource_id"),
                ip_address=doc.get("ip_address"),
                user_agent=doc.get("user_agent"),
                details=doc.get("details", {}),
                timestamp=doc.get("timestamp", "")
            )
            for doc in docs
        ]
