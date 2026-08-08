import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.database.mongodb import db_manager
from app.core.logging import logger


class ATSHistoryService:
    """
    Service managing ATS analysis records, score trends, and keyword match breakdowns over time.
    """

    @staticmethod
    async def record_analysis(
        user_id: str,
        resume_id: Optional[str],
        resume_title: str,
        company: str,
        job_title: str,
        job_description: str,
        score: int,
        match_status: str,
        matching_keywords: List[str],
        missing_keywords: List[str],
        recommendations: List[str],
        version_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Record an ATS audit in the persistent database."""
        if db_manager.db is None:
            return {}

        history_id = f"ats_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)

        doc = {
            "_id": history_id,
            "history_id": history_id,
            "user_id": user_id,
            "resume_id": resume_id or "",
            "version_id": version_id or "",
            "resume_title": resume_title or "Target Resume",
            "company": company or "Target Organization",
            "job_title": job_title or "Software Engineer",
            "job_description": job_description[:2000] if job_description else "",
            "ats_score": score,
            "match_status": match_status,
            "matching_keywords": matching_keywords or [],
            "missing_keywords": missing_keywords or [],
            "improvement_recommendations": recommendations or [],
            "created_at": now
        }

        await db_manager.db["ats_analysis_history"].insert_one(doc)
        logger.info(f"Recorded ATS audit {history_id} (Score: {score}%) for user {user_id}")
        doc["id"] = history_id
        return doc

    @staticmethod
    async def get_history(user_id: str, limit: int = 30) -> List[Dict[str, Any]]:
        """Retrieve historical ATS audits for authenticated user."""
        if db_manager.db is None:
            return []

        history = []
        cursor = db_manager.db["ats_analysis_history"].find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(limit)

        async for doc in cursor:
            doc["id"] = str(doc.get("_id") or doc.get("history_id"))
            history.append(doc)

        return history

    @staticmethod
    async def get_score_trend(user_id: str) -> List[Dict[str, Any]]:
        """Aggregate score trend data across companies and target roles."""
        if db_manager.db is None:
            return []

        trend = []
        cursor = db_manager.db["ats_analysis_history"].find(
            {"user_id": user_id}
        ).sort("created_at", 1).limit(10)

        async for doc in cursor:
            trend.append({
                "company": doc.get("company") or "Target",
                "job_title": doc.get("job_title") or "Role",
                "score": doc.get("ats_score", 80),
                "date": doc.get("created_at", datetime.now(timezone.utc)).strftime("%b %d")
            })

        return trend

    @staticmethod
    async def delete_entry(user_id: str, history_id: str) -> bool:
        """Delete an ATS analysis record."""
        if db_manager.db is None:
            return False

        res = await db_manager.db["ats_analysis_history"].delete_one({"_id": history_id, "user_id": user_id})
        return res.deleted_count > 0
