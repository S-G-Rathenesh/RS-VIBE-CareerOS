import json
from typing import Optional
from pydantic import BaseModel
from app.providers.ai.groq_provider import groq_provider
from app.services.credit_service import CreditService
from app.database.mongodb import db_manager


class GeneratePortfolioRequest(BaseModel):
    resume_id: str
    theme_id: Optional[str] = "developer"


class GeneratedPortfolioResponse(BaseModel):
    title: str
    tagline: str
    about: str
    projects: list
    skills: list
    seo_title: str
    seo_description: str
    theme_id: str


class PortfolioGeneratorService:
    """AI Portfolio Generator — auto-generate a complete portfolio from resume data."""

    @classmethod
    async def generate_from_resume(cls, user_id: str, request: GeneratePortfolioRequest) -> GeneratedPortfolioResponse:
        """Generate a complete portfolio structure from resume data."""
        await CreditService.deduct_credits(user_id, "SUMMARY_GEN", "AI Portfolio generation from resume")

        db = db_manager.db
        resume_text = ""
        full_name = "Professional"
        if db is not None:
            resume = await db["resumes"].find_one({"_id": request.resume_id, "user_id": user_id})
            if resume:
                personal = resume.get("personal_info", {})
                full_name = personal.get("full_name", "Professional")
                skills = [s.get("name", s) if isinstance(s, dict) else str(s) for s in resume.get("skills", [])]
                projects = [p.get("name", "") for p in resume.get("projects", []) if isinstance(p, dict)]
                experience = [f"{e.get('title', '')} at {e.get('company', '')}" for e in resume.get("work_experience", []) if isinstance(e, dict)]
                resume_text = f"Name: {full_name}\nSkills: {', '.join(skills)}\nProjects: {', '.join(projects)}\nExperience: {'; '.join(experience)}"

        prompt = f"""Generate a complete portfolio website content from this resume data.

{resume_text or 'Software professional with various skills and projects'}

Return JSON:
{{
  "title": "{full_name} — Portfolio",
  "tagline": "A compelling professional tagline",
  "about": "A compelling 2-3 sentence bio highlighting key strengths",
  "projects": [{{"name": "...", "description": "...", "tech_stack": ["..."], "live_url": "", "github_url": ""}}],
  "skills": [{{"name": "...", "level": "expert"}}],
  "seo_title": "{full_name} | Software Engineer Portfolio",
  "seo_description": "A meta description for SEO",
  "theme_id": "{request.theme_id or 'developer'}"
}}

Return ONLY the JSON, no other text."""

        messages = [{"role": "user", "content": prompt}]
        raw = await groq_provider.generate(messages)

        try:
            data = json.loads(raw.strip().strip("```json").strip("```"))
        except json.JSONDecodeError:
            data = {
                "title": f"{full_name} — Portfolio",
                "tagline": "Passionate software professional",
                "about": f"{full_name} is a dedicated professional with expertise in modern technologies.",
                "projects": [],
                "skills": [],
                "seo_title": f"{full_name} | Portfolio",
                "seo_description": f"Professional portfolio of {full_name}.",
                "theme_id": request.theme_id or "developer"
            }

        return GeneratedPortfolioResponse(**data)
