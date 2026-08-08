import uuid
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from passlib.context import CryptContext
from app.database.mongodb import db_manager
from app.schemas.sharing import ShareSettingsUpdate, ShareSettingsResponse
from app.services.resume_service import ResumeService

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class ResumeSharingService:
    @staticmethod
    async def configure_share_settings(resume_id: str, user_id: str, dto: ShareSettingsUpdate) -> ShareSettingsResponse:
        resume = await ResumeService.get_resume_by_id(resume_id, user_id)

        short_id = resume.get("short_id")
        if not short_id:
            short_id = uuid.uuid4().hex[:8]

        password_hash = None
        if dto.password and len(dto.password.strip()) > 0:
            password_hash = pwd_context.hash(dto.password.strip())

        expires_at = None
        if dto.expiry_days and dto.expiry_days > 0:
            expires_at = datetime.now(timezone.utc) + timedelta(days=dto.expiry_days)

        update_payload = {
            "short_id": short_id,
            "is_public": dto.is_public,
            "password_hash": password_hash,
            "expires_at": expires_at,
            "allow_download": dto.allow_download,
            "updated_at": datetime.now(timezone.utc)
        }

        if db_manager.db is not None:
            await db_manager.db["resumes"].update_one(
                {"_id": resume_id, "user_id": user_id},
                {"$set": update_payload}
            )

        return ShareSettingsResponse(
            resume_id=resume_id,
            short_id=short_id,
            share_url=f"https://exploreme.ai/r/{short_id}",
            is_public=dto.is_public,
            is_password_protected=password_hash is not None,
            expires_at=expires_at,
            allow_download=dto.allow_download
        )

    @staticmethod
    async def verify_password(provided_password: str, stored_hash: str) -> bool:
        return pwd_context.verify(provided_password, stored_hash)
