from typing import List, Optional
from pydantic import BaseModel, Field


class WeakBulletItem(BaseModel):
    original_bullet: str
    reason: str
    suggested_improvement: str


class AuditCategory(BaseModel):
    name: str
    score: int
    status: str
    feedback: str


class ResumeAuditResponse(BaseModel):
    overall_score: int
    ats_score: int
    readability_score: int
    action_verb_density: str
    detected_keywords: List[str] = []
    missing_keywords: List[str] = []
    weak_bullets: List[WeakBulletItem] = []
    audit_categories: List[AuditCategory] = []
    recommendations: List[str] = []
