from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, model_validator


class ATSScoreRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None
    job_description: str = Field(..., min_length=10)
    target_role: Optional[str] = None

    @model_validator(mode="after")
    def validate_resume_source(self):
        if not self.resume_id and not (self.resume_text and len(self.resume_text.strip()) >= 10):
            raise ValueError("Either resume_id or resume_text (min 10 characters) must be provided.")
        return self


class ATSScoreResponse(BaseModel):
    score: int
    match_status: str
    matching_keywords: List[str]
    missing_keywords: List[str]
    improvement_recommendations: List[str]


class SummaryGenerateRequest(BaseModel):
    job_title: str
    experience_level: str = "Mid-Senior"
    skills: List[str] = []
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None


class BulletPointOptimizeRequest(BaseModel):
    bullets: List[str]
    target_role: Optional[str] = None


class CoverLetterGenerateRequest(BaseModel):
    full_name: str
    target_role: str
    company_name: str
    job_description: Optional[str] = None
    skills: List[str] = []
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None


class SkillSuggestRequest(BaseModel):
    job_title: str
    existing_skills: List[str] = []


class GrammarCheckRequest(BaseModel):
    text: str


class ExtractTextResponse(BaseModel):
    filename: str
    raw_text: str
    character_count: int


class ResumePreviewResponse(BaseModel):
    filename: str
    resume_data: Dict[str, Any]
    ats_text: str
