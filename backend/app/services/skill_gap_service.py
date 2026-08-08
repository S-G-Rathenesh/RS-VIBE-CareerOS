import json
from typing import List, Optional
from pydantic import BaseModel
from app.providers.ai.groq_provider import groq_provider
from app.services.credit_service import CreditService


class SkillGapRequest(BaseModel):
    current_skills: List[str]
    target_job_title: str
    target_job_description: Optional[str] = ""


class SkillGapItem(BaseModel):
    skill: str
    priority: str  # "critical", "high", "medium", "low"
    estimated_hours: int
    recommended_project: str


class SkillGapResponse(BaseModel):
    target_role: str
    match_percentage: int
    missing_skills: List[SkillGapItem]
    strong_skills: List[str]


class SkillGapService:
    """AI Skill Gap Analysis — compare current skills vs. target job requirements."""

    @classmethod
    async def analyze(cls, user_id: str, request: SkillGapRequest) -> SkillGapResponse:
        """Analyze skill gaps against target job."""
        await CreditService.deduct_credits(user_id, "RESUME_ANALYSIS", f"Skill gap for {request.target_job_title}")

        prompt = f"""Analyze skill gaps for a candidate.

Current Skills: {', '.join(request.current_skills)}
Target Job Title: {request.target_job_title}
Job Description: {request.target_job_description or 'General requirements for this role'}

Return JSON:
{{
  "target_role": "{request.target_job_title}",
  "match_percentage": 65,
  "missing_skills": [
    {{"skill": "...", "priority": "critical", "estimated_hours": 40, "recommended_project": "Build a ..."}}
  ],
  "strong_skills": ["..."]
}}

Return ONLY the JSON, no other text."""

        messages = [{"role": "user", "content": prompt}]
        raw = await groq_provider.generate(messages)

        try:
            data = json.loads(raw.strip().strip("```json").strip("```"))
        except json.JSONDecodeError:
            data = {
                "target_role": request.target_job_title,
                "match_percentage": 60,
                "missing_skills": [{"skill": "Industry-specific skill", "priority": "high", "estimated_hours": 30, "recommended_project": "Build a relevant project"}],
                "strong_skills": request.current_skills[:3]
            }

        return SkillGapResponse(**data)
