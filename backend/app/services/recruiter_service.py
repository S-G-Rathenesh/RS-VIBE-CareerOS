import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from app.database.mongodb import db_manager
from app.core.exceptions import NotFoundException, InternalServerErrorException
from app.schemas.job_application import RecruiterCreate, RecruiterUpdate


class RecruiterService:
    @staticmethod
    def _collection():
        if db_manager.db is None:
            raise InternalServerErrorException("Database not connected")
        return db_manager.db["recruiters"]

    @classmethod
    async def create_recruiter(cls, user_id: str, data: RecruiterCreate) -> Dict[str, Any]:
        col = cls._collection()
        now = datetime.now(timezone.utc)
        doc = data.model_dump()
        doc["id"] = f"rec_{uuid.uuid4().hex[:12]}"
        doc["user_id"] = user_id
        doc["last_contact"] = now
        doc["created_at"] = now
        doc["updated_at"] = now

        await col.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @classmethod
    async def list_recruiters(cls, user_id: str, company: Optional[str] = None) -> List[Dict[str, Any]]:
        col = cls._collection()
        query: Dict[str, Any] = {"user_id": user_id}
        if company:
            query["company"] = {"$regex": company, "$options": "i"}

        cursor = col.find(query).sort("updated_at", -1)
        results = await cursor.to_list(length=200)
        for r in results:
            r.pop("_id", None)
        return results

    @classmethod
    async def get_recruiter(cls, recruiter_id: str, user_id: str) -> Dict[str, Any]:
        col = cls._collection()
        doc = await col.find_one({"id": recruiter_id, "user_id": user_id})
        if not doc:
            raise NotFoundException("Recruiter not found")
        doc.pop("_id", None)
        return doc

    @classmethod
    async def update_recruiter(cls, recruiter_id: str, user_id: str, data: RecruiterUpdate) -> Dict[str, Any]:
        col = cls._collection()
        existing = await col.find_one({"id": recruiter_id, "user_id": user_id})
        if not existing:
            raise NotFoundException("Recruiter not found")

        updates = {k: v for k, v in data.model_dump().items() if v is not None}
        if not updates:
            existing.pop("_id", None)
            return existing

        now = datetime.now(timezone.utc)
        updates["updated_at"] = now
        updates["last_contact"] = now

        await col.update_one({"id": recruiter_id, "user_id": user_id}, {"$set": updates})
        return await cls.get_recruiter(recruiter_id, user_id)

    @classmethod
    async def delete_recruiter(cls, recruiter_id: str, user_id: str) -> bool:
        col = cls._collection()
        res = await col.delete_one({"id": recruiter_id, "user_id": user_id})
        if res.deleted_count == 0:
            raise NotFoundException("Recruiter not found")
        return True
