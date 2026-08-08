from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    avatar_url: Optional[str] = None
    avatar_public_id: Optional[str] = None
    candidate_visibility: Optional[str] = "public"
    role: str
    is_email_verified: bool
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    avatar_url: Optional[str] = None
    avatar_public_id: Optional[str] = None
    candidate_visibility: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)
