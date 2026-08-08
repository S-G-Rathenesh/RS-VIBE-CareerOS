from typing import List, Optional
from pydantic import BaseModel, Field


class EnhanceTextRequest(BaseModel):
    text: str = Field(..., min_length=5)
    section_type: str = "summary"  # "summary" | "bullet" | "project" | "objective" | "skills"
    tone: str = "professional"     # "executive" | "technical" | "recruiter" | "student" | "professional"
    target_role: Optional[str] = "Software Engineer"


class EnhanceTextResponse(BaseModel):
    original_text: str
    enhanced_text: str
    tone_used: str
    alternative_variations: List[str] = []
