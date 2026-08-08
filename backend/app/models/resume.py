from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class WorkExperience(BaseModel):
    id: str
    company: str
    position: str
    duration: str
    location: Optional[str] = None
    bullets: List[str] = []


class EducationItem(BaseModel):
    id: str
    institution: str
    degree: str
    field_of_study: str
    duration: str
    grade: Optional[str] = None


class SkillCategory(BaseModel):
    id: str
    category: str
    items: List[str] = []


class ProjectItem(BaseModel):
    id: str
    name: str
    description: str
    tech_stack: List[str] = []
    link: Optional[str] = None


class CertificateItem(BaseModel):
    id: str
    name: str
    issuer: str
    date: str


class PersonalInfo(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    summary: Optional[str] = None


class ThemeConfig(BaseModel):
    primary_color: str = "#6366f1"
    font_family: str = "Inter"
    spacing: str = "normal"  # "compact" | "normal" | "spacious"


class ResumeModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: str
    title: str = "Untitled Resume"
    target_role: str = "Software Engineer"
    template_id: str = "modern_linear"
    ats_score: int = 88
    theme_config: ThemeConfig = Field(default_factory=ThemeConfig)
    personal_info: PersonalInfo = Field(default_factory=PersonalInfo)
    work_experience: List[WorkExperience] = []
    education: List[EducationItem] = []
    skills: List[SkillCategory] = []
    projects: List[ProjectItem] = []
    certificates: List[CertificateItem] = []
    section_order: List[str] = Field(
        default_factory=lambda: ["personal", "summary", "experience", "skills", "projects", "education", "certificates"]
    )
    versions: List[Dict[str, Any]] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
