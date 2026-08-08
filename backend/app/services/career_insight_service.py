from typing import Any, Dict, List
from app.database.mongodb import db_manager
from app.core.exceptions import InternalServerErrorException
from app.schemas.job_application import CareerInsightResponse
from app.services.career_analytics_service import CareerAnalyticsService


class CareerInsightService:
    @classmethod
    async def get_insights(cls, user_id: str) -> CareerInsightResponse:
        analytics = await CareerAnalyticsService.get_analytics(user_id)

        insights: List[Dict[str, Any]] = []

        if analytics.total_applications == 0:
            insights.append({
                "type": "ACTIONABLE_TIP",
                "title": "Start Your Career Pipeline",
                "message": "Use the 1-Click Apply Pipeline inside Resume Builder to tailor versions and track applications effortlessly.",
                "impact": "High",
                "icon": "zap",
            })
            summary = "Your career CRM is ready. Apply to your first target role to generate AI correlation insights."
        else:
            # Insight 1: ATS threshold correlation
            if analytics.average_ats_score >= 88:
                insights.append({
                    "type": "PERFORMANCE",
                    "title": "High ATS Compatibility Advantage",
                    "message": f"Your average ATS score is {analytics.average_ats_score}%. Candidates in this tier experience up to 2.4x higher recruiter callbacks.",
                    "impact": "High",
                    "icon": "trending-up",
                })
            else:
                insights.append({
                    "type": "RECOMMENDATION",
                    "title": "Boost ATS Alignment",
                    "message": "Target matching at least 88% on job descriptions before submitting to maximize screening pass rates.",
                    "impact": "Medium",
                    "icon": "alert-circle",
                })

            # Insight 2: Top performing version
            if analytics.top_performing_resumes:
                top_v = analytics.top_performing_resumes[0]
                insights.append({
                    "type": "VERSION_CORRELATION",
                    "title": f"Top Asset: {top_v['version_name']}",
                    "message": f"This tailored edition achieved {top_v['conversion_rate']}% interview conversion across {top_v['applied_count']} submissions. Reuse its bullet phrasing for similar roles.",
                    "impact": "High",
                    "icon": "award",
                })

            # Insight 3: Funnel Momentum
            if analytics.total_interviews > 0:
                insights.append({
                    "type": "MILESTONE",
                    "title": "Interview Pipeline Active",
                    "message": f"You currently have {analytics.total_interviews} active interview rounds across target tech companies. Use the AI Interview Prep Station to practice targeted system design and behavioral questions.",
                    "impact": "Critical",
                    "icon": "sparkles",
                })

            summary = f"Pipeline Health: {analytics.total_applications} applications tracked, {analytics.total_interviews} interviews generated ({analytics.interview_conversion_rate}% conversion rate)."

        return CareerInsightResponse(
            insights=insights,
            weekly_summary=summary,
        )
