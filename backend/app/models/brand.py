from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class BrandProfile(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: str
    statement: str = ""
    headline: str = ""
    short_bio: str = ""
    long_bio: str = ""
    career_mission: str = ""
    career_vision: str = ""
    elevator_pitch: str = ""
    networking_intro: str = ""
    target_audience: List[str] = []
    tone_of_voice: str = "Professional"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class BrandingScore(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: str
    overall_score: int = 0
    consistency_score: int = 0
    seo_score: int = 0
    accessibility_score: int = 0
    performance_score: int = 0
    suggestions: List[Dict[str, str]] = []  # [{"type": "color", "message": "..."}]
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
