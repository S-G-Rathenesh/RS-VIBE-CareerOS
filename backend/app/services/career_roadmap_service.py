import json
from typing import List, Optional
from pydantic import BaseModel
from app.providers.ai.groq_provider import groq_provider
from app.services.credit_service import CreditService


class RoadmapRequest(BaseModel):
    current_skills: List[str]
    desired_role: str
    experience_years: int = 0
    location: Optional[str] = ""


class RoadmapResponse(BaseModel):
    desired_role: str
    timeline_months: int
    phases: List[dict]
    recommended_courses: List[str]
    recommended_books: List[str]
    recommended_certifications: List[str]
    recommended_projects: List[str]
    salary_range: dict


class CareerRoadmapService:
    """AI Career Roadmap Generator — personalized learning paths."""

    @classmethod
    async def generate_roadmap(cls, user_id: str, request: RoadmapRequest) -> RoadmapResponse:
        """Generate a personalized career roadmap using AI."""
        await CreditService.deduct_credits(user_id, "SUMMARY_GEN", f"Career roadmap for {request.desired_role}")

        prompt = f"""Generate a detailed career roadmap.

Current Skills: {', '.join(request.current_skills)}
Desired Role: {request.desired_role}
Experience: {request.experience_years} years
Location: {request.location or 'Remote'}

Return JSON:
{{
  "desired_role": "{request.desired_role}",
  "timeline_months": 6,
  "phases": [
    {{"phase": 1, "title": "Foundation", "duration_weeks": 4, "skills_to_learn": ["..."], "milestones": ["..."]}},
    {{"phase": 2, "title": "Intermediate", "duration_weeks": 8, "skills_to_learn": ["..."], "milestones": ["..."]}},
    {{"phase": 3, "title": "Advanced", "duration_weeks": 8, "skills_to_learn": ["..."], "milestones": ["..."]}}
  ],
  "recommended_courses": ["..."],
  "recommended_books": ["..."],
  "recommended_certifications": ["..."],
  "recommended_projects": ["..."],
  "salary_range": {{"min": 80000, "max": 150000, "currency": "USD", "location": "{request.location or 'Remote'}"}}
}}

Return ONLY the JSON, no other text."""

        messages = [{"role": "user", "content": prompt}]
        raw = await groq_provider.generate(messages)

        try:
            data = json.loads(raw.strip().strip("```json").strip("```"))
        except json.JSONDecodeError:
            data = {
                "desired_role": request.desired_role,
                "timeline_months": 6,
                "phases": [{"phase": 1, "title": "Foundation", "duration_weeks": 8, "skills_to_learn": request.current_skills, "milestones": ["Complete foundational courses"]}],
                "recommended_courses": ["Relevant online courses"],
                "recommended_books": ["Industry standard books"],
                "recommended_certifications": ["Professional certifications"],
                "recommended_projects": ["Build a portfolio project"],
                "salary_range": {"min": 60000, "max": 120000, "currency": "USD", "location": request.location or "Remote"}
            }

        return RoadmapResponse(**data)
