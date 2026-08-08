from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId

class JobPostModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    company_id: str
    recruiter_id: str
    title: str
    department: Optional[str] = None
    employment_type: str = "Full-time" # Full-time, Part-time, Contract, Internship
    experience_level: str = "Mid-Level" # Entry, Mid, Senior, Lead, Executive
    skills: List[str] = Field(default_factory=list)
    salary_range: Optional[str] = None # e.g. "$120k - $150k"
    location: str
    work_mode: str = "Remote" # Remote, Hybrid, On-site
    responsibilities: List[str] = Field(default_factory=list)
    requirements: List[str] = Field(default_factory=list)
    benefits: List[str] = Field(default_factory=list)
    status: str = "draft" # draft, published, closed, archived
    application_deadline: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
