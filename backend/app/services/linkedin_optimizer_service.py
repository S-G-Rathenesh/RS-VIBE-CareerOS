import json
from typing import List
from pydantic import BaseModel
from app.providers.ai.groq_provider import groq_provider
from app.services.credit_service import CreditService


class LinkedInOptimizeRequest(BaseModel):
    current_headline: str = ""
    current_about: str = ""
    current_experience: List[str] = []
    current_skills: List[str] = []
    target_role: str = ""


class LinkedInOptimizeResponse(BaseModel):
    optimized_headline: str
    optimized_about: str
    optimized_experience_bullets: List[str]
    recommended_skills: List[str]
    featured_suggestions: List[str]
    improvement_score: int


class LinkedInOptimizerService:
    """AI LinkedIn Profile Optimizer."""

    @classmethod
    async def optimize(cls, user_id: str, request: LinkedInOptimizeRequest) -> LinkedInOptimizeResponse:
        """Optimize LinkedIn profile sections using AI."""
        await CreditService.deduct_credits(user_id, "TEXT_ENHANCEMENT", f"LinkedIn optimize for {request.target_role}")

        prompt = f"""Optimize this LinkedIn profile for maximum recruiter visibility.

Current Headline: {request.current_headline or 'Not set'}
Current About: {request.current_about or 'Not set'}
Current Experience: {'; '.join(request.current_experience) or 'Not provided'}
Current Skills: {', '.join(request.current_skills) or 'Not provided'}
Target Role: {request.target_role or 'Software Engineer'}

Return JSON:
{{
  "optimized_headline": "A keyword-rich professional headline under 120 chars",
  "optimized_about": "A compelling 3-paragraph About section with keywords",
  "optimized_experience_bullets": ["Impact-driven bullet with metrics", "..."],
  "recommended_skills": ["Skill 1", "Skill 2"],
  "featured_suggestions": ["What to feature on your profile"],
  "improvement_score": 85
}}

Return ONLY the JSON, no other text."""

        messages = [{"role": "user", "content": prompt}]
        raw = await groq_provider.generate(messages)

        try:
            data = json.loads(raw.strip().strip("```json").strip("```"))
        except json.JSONDecodeError:
            data = {
                "optimized_headline": f"{request.target_role or 'Software Engineer'} | Building Impactful Solutions",
                "optimized_about": "A passionate professional dedicated to building high-quality software solutions.",
                "optimized_experience_bullets": ["Led development of key features resulting in measurable impact"],
                "recommended_skills": request.current_skills[:5] if request.current_skills else ["Problem Solving"],
                "featured_suggestions": ["Add a portfolio link", "Showcase top projects"],
                "improvement_score": 70
            }

        return LinkedInOptimizeResponse(**data)
