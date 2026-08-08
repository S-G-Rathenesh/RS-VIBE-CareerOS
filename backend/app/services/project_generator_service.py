import json
from typing import List, Optional
from pydantic import BaseModel
from app.providers.ai.groq_provider import groq_provider
from app.services.credit_service import CreditService


class ProjectGenerateRequest(BaseModel):
    skills: List[str]
    target_role: Optional[str] = ""
    difficulty: Optional[str] = "intermediate"  # "beginner", "intermediate", "advanced"
    count: Optional[int] = 3


class GeneratedProject(BaseModel):
    name: str
    description: str
    architecture: str
    folder_structure: List[str]
    tech_stack: List[str]
    timeline_weeks: int
    difficulty: str
    learning_outcomes: List[str]


class ProjectGeneratorService:
    """AI Project Generator — suggest portfolio-worthy projects with architecture."""

    @classmethod
    async def generate_projects(cls, user_id: str, request: ProjectGenerateRequest) -> List[GeneratedProject]:
        """Generate portfolio project suggestions using AI."""
        await CreditService.deduct_credits(user_id, "SUMMARY_GEN", f"Project ideas for {request.target_role or 'portfolio'}")

        prompt = f"""Suggest {request.count or 3} impressive portfolio projects for a developer.

Skills: {', '.join(request.skills)}
Target Role: {request.target_role or 'Full Stack Developer'}
Difficulty: {request.difficulty or 'intermediate'}

For each project, return JSON array:
[{{
  "name": "Project Name",
  "description": "2-3 sentence description of what it does and why it's impressive",
  "architecture": "Brief architecture overview (e.g., React frontend + Node.js API + PostgreSQL)",
  "folder_structure": ["src/", "src/components/", "src/api/", "src/utils/"],
  "tech_stack": ["React", "Node.js", "PostgreSQL"],
  "timeline_weeks": 4,
  "difficulty": "{request.difficulty}",
  "learning_outcomes": ["What the developer will learn"]
}}]

Return ONLY the JSON array, no other text."""

        messages = [{"role": "user", "content": prompt}]
        raw = await groq_provider.generate(messages)

        try:
            data = json.loads(raw.strip().strip("```json").strip("```"))
        except json.JSONDecodeError:
            data = [{
                "name": "Full Stack Portfolio App",
                "description": "A comprehensive portfolio application showcasing modern development practices.",
                "architecture": "React + FastAPI + MongoDB",
                "folder_structure": ["frontend/", "backend/", "docs/"],
                "tech_stack": request.skills[:5] if request.skills else ["React", "Python"],
                "timeline_weeks": 4,
                "difficulty": request.difficulty or "intermediate",
                "learning_outcomes": ["Full stack development", "API design", "Database management"]
            }]

        return [GeneratedProject(**p) for p in data[:request.count or 3]]
