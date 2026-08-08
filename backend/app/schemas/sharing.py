from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ShareSettingsUpdate(BaseModel):
    is_public: bool = True
    password: Optional[str] = None
    expiry_days: Optional[int] = None  # None = Never, 1, 7, 30
    allow_download: bool = True


class ShareSettingsResponse(BaseModel):
    resume_id: str
    short_id: str
    share_url: str
    is_public: bool
    is_password_protected: bool
    expires_at: Optional[datetime] = None
    allow_download: bool


class VerifyPasswordRequest(BaseModel):
    password: str
