from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.models.resume import (
    PersonalInfo, 
    ThemeConfig, 
    WorkExperience, 
    EducationItem, 
    SkillCategory, 
    ProjectItem, 
    CertificateItem
)


class ResumeCreate(BaseModel):
    title: str = "My Tech Resume"
    target_role: str = "Full Stack Engineer"
    template_id: str = "modern_linear"


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    target_role: Optional[str] = None
    template_id: Optional[str] = None
    ats_score: Optional[int] = None
    theme_config: Optional[ThemeConfig] = None
    personal_info: Optional[PersonalInfo] = None
    work_experience: Optional[List[WorkExperience]] = None
    education: Optional[List[EducationItem]] = None
    skills: Optional[List[SkillCategory]] = None
    projects: Optional[List[ProjectItem]] = None
    certificates: Optional[List[CertificateItem]] = None
    section_order: Optional[List[str]] = None


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    target_role: str
    template_id: str
    ats_score: int
    theme_config: ThemeConfig
    personal_info: PersonalInfo
    work_experience: List[WorkExperience]
    education: List[EducationItem]
    skills: List[SkillCategory]
    projects: List[ProjectItem]
    certificates: List[CertificateItem]
    section_order: List[str]
    created_at: datetime
    updated_at: datetime
