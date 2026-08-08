from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class ApplicationModel(BaseModel):
    """Represents a candidate's application in the hiring pipeline."""
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    job_id: str
    candidate_id: str
    status: str = "applied" # applied, screening, interview, technical, hr, offer, hired, rejected
    applied_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    notes: List[Dict[str, Any]] = Field(default_factory=list) # e.g. {"author_id": "...", "text": "...", "timestamp": "..."}
    tags: List[str] = Field(default_factory=list)

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class CandidateMatchModel(BaseModel):
    """AI-generated match report between a candidate and a job post."""
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    job_id: str
    candidate_id: str
    match_score: int # 0-100
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    recommendation: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class InterviewModel(BaseModel):
    """Stores interview scheduling information."""
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    job_id: str
    candidate_id: str
    recruiter_id: str
    date_time: datetime
    mode: str = "video" # video, phone, in-person
    meeting_link: Optional[str] = None
    panel_members: List[str] = Field(default_factory=list)
    status: str = "scheduled" # scheduled, completed, cancelled, rescheduled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class MessageModel(BaseModel):
    """Real-time secure messaging between candidate and recruiter."""
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    sender_id: str
    receiver_id: str
    job_id: Optional[str] = None # Optional context
    content: str
    is_read: bool = False
    attachments: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
