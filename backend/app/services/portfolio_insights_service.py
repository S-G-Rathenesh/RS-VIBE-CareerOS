import json
from typing import List
from pydantic import BaseModel
from app.providers.ai.groq_provider import groq_provider
from app.services.credit_service import CreditService
from app.database.mongodb import db_manager


class PortfolioInsightsRequest(BaseModel):
    portfolio_id: str


class PortfolioInsightsResponse(BaseModel):
    popular_projects: List[dict]
    weak_pages: List[dict]
    seo_suggestions: List[str]
    content_improvements: List[str]
    overall_score: int


class PortfolioInsightsService:
    """AI Portfolio Insights — analyze visitor behavior and recommend improvements."""

    @classmethod
    async def analyze(cls, user_id: str, request: PortfolioInsightsRequest) -> PortfolioInsightsResponse:
        """Analyze portfolio and recommend improvements."""
        await CreditService.deduct_credits(user_id, "RESUME_ANALYSIS", "Portfolio AI insights")

        db = db_manager.db
        portfolio_context = ""
        if db is not None:
            portfolio = await db["portfolios"].find_one({"_id": request.portfolio_id, "user_id": user_id})
            if portfolio:
                title = portfolio.get("title", "")
                tagline = portfolio.get("tagline", "")
                projects = [p.get("name", "") for p in portfolio.get("projects", []) if isinstance(p, dict)]
                portfolio_context = f"Title: {title}\nTagline: {tagline}\nProjects: {', '.join(projects)}"

            # Get analytics data
            analytics_count = await db["portfolio_analytics"].count_documents({"portfolio_id": request.portfolio_id})
            portfolio_context += f"\nTotal Visitor Events: {analytics_count}"

        prompt = f"""Analyze this portfolio and provide actionable improvement recommendations.

{portfolio_context or 'Portfolio with standard content'}

Return JSON:
{{
  "popular_projects": [{{"name": "...", "engagement_score": 85}}],
  "weak_pages": [{{"page": "...", "issue": "...", "recommendation": "..."}}],
  "seo_suggestions": ["Suggestion 1", "Suggestion 2"],
  "content_improvements": ["Improvement 1", "Improvement 2"],
  "overall_score": 72
}}

Return ONLY the JSON, no other text."""

        messages = [{"role": "user", "content": prompt}]
        raw = await groq_provider.generate(messages)

        try:
            data = json.loads(raw.strip().strip("```json").strip("```"))
        except json.JSONDecodeError:
            data = {
                "popular_projects": [],
                "weak_pages": [{"page": "About", "issue": "Too brief", "recommendation": "Add more detail about your expertise"}],
                "seo_suggestions": ["Add meta descriptions", "Include relevant keywords"],
                "content_improvements": ["Add case studies to projects", "Include testimonials"],
                "overall_score": 65
            }

        return PortfolioInsightsResponse(**data)
