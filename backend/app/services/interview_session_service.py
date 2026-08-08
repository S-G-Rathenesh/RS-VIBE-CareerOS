import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.database.mongodb import db_manager
from app.core.exceptions import NotFoundException, InternalServerErrorException
from app.schemas.job_application import InterviewSessionCreate


class InterviewSessionService:
    @staticmethod
    def _collection():
        if db_manager.db is None:
            raise InternalServerErrorException("Database not connected")
        return db_manager.db["application_interviews"]

    @classmethod
    async def create_session(
        cls, user_id: str, application_id: str, data: InterviewSessionCreate
    ) -> Dict[str, Any]:
        col = cls._collection()
        now = datetime.now(timezone.utc)
        doc = data.model_dump()
        doc["id"] = f"iv_{uuid.uuid4().hex[:12]}"
        doc["user_id"] = user_id
        doc["application_id"] = application_id
        doc["created_at"] = now
        doc["updated_at"] = now

        await col.insert_one(doc)

        # Log timeline event on parent application
        if db_manager.db is not None:
            t_col = db_manager.db["application_timelines"]
            await t_col.insert_one({
                "id": f"time_{uuid.uuid4().hex[:12]}",
                "application_id": application_id,
                "user_id": user_id,
                "event_type": "INTERVIEW_SCHEDULED",
                "title": f"Interview Scheduled: {data.round_name}",
                "description": f"Interviewer: {data.interviewer_name or 'Hiring Team'} ({data.interviewer_role or 'Technical Round'})",
                "icon": "video",
                "metadata": {"session_id": doc["id"]},
                "date": data.scheduled_at or now,
                "created_at": now,
            })

        doc.pop("_id", None)
        return doc

    @classmethod
    async def list_sessions(cls, user_id: str, application_id: str) -> List[Dict[str, Any]]:
        col = cls._collection()
        cursor = col.find({"application_id": application_id, "user_id": user_id}).sort("created_at", -1)
        results = await cursor.to_list(length=100)
        for r in results:
            r.pop("_id", None)
        return results

    @classmethod
    async def get_session(cls, session_id: str, user_id: str) -> Dict[str, Any]:
        col = cls._collection()
        doc = await col.find_one({"id": session_id, "user_id": user_id})
        if not doc:
            raise NotFoundException("Interview session not found")
        doc.pop("_id", None)
        return doc

    @classmethod
    async def update_session(cls, session_id: str, user_id: str, updates_data: Dict[str, Any]) -> Dict[str, Any]:
        col = cls._collection()
        existing = await col.find_one({"id": session_id, "user_id": user_id})
        if not existing:
            raise NotFoundException("Interview session not found")

        clean_updates = {k: v for k, v in updates_data.items() if v is not None}
        clean_updates["updated_at"] = datetime.now(timezone.utc)

        await col.update_one({"id": session_id, "user_id": user_id}, {"$set": clean_updates})
        return await cls.get_session(session_id, user_id)

    @classmethod
    async def delete_session(cls, session_id: str, user_id: str) -> bool:
        col = cls._collection()
        res = await col.delete_one({"id": session_id, "user_id": user_id})
        if res.deleted_count == 0:
            raise NotFoundException("Interview session not found")
        return True
