import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.database.mongodb import db_manager
from app.core.logging import logger


class CoverLetterHistoryService:
    """
    Service managing persistent cover letters linked to resume versions and target companies.
    """

    @staticmethod
    async def record_cover_letter(
        user_id: str,
        company_name: str,
        target_role: str,
        cover_letter: str,
        resume_id: Optional[str] = None,
        version_id: Optional[str] = None,
        job_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Save a generated cover letter in MongoDB."""
        if db_manager.db is None:
            return {}

        cover_id = f"cl_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)

        doc = {
            "_id": cover_id,
            "cover_id": cover_id,
            "user_id": user_id,
            "resume_id": resume_id or "",
            "version_id": version_id or "",
            "company_name": company_name,
            "target_role": target_role,
            "job_description": job_description[:1500] if job_description else "",
            "cover_letter": cover_letter,
            "created_at": now
        }

        await db_manager.db["cover_letter_history"].insert_one(doc)
        logger.info(f"Recorded cover letter {cover_id} for {company_name} by user {user_id}")
        doc["id"] = cover_id
        return doc

    @staticmethod
    async def list_cover_letters(user_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """List generated cover letters for authenticated user."""
        if db_manager.db is None:
            return []

        letters = []
        cursor = db_manager.db["cover_letter_history"].find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(limit)

        async for doc in cursor:
            doc["id"] = str(doc.get("_id") or doc.get("cover_id"))
            letters.append(doc)

        return letters

    @staticmethod
    async def delete_cover_letter(user_id: str, cover_id: str) -> bool:
        """Delete a cover letter entry."""
        if db_manager.db is None:
            return False

        res = await db_manager.db["cover_letter_history"].delete_one({"_id": cover_id, "user_id": user_id})
        return res.deleted_count > 0
