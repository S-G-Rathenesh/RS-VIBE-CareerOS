from datetime import datetime, timezone
from app.database.mongodb import db_manager
from app.schemas.dashboard import (
    DashboardOverviewResponse, 
    MetricSummary, 
    RecentResumeItem, 
    RecentVersionItem,
    ATSTrendItem,
    RecentPortfolioItem, 
    ActivityItem
)


class DashboardService:
    @staticmethod
    async def get_overview(user_id: str) -> DashboardOverviewResponse:
        total_resumes = 0
        total_versions = 0
        total_portfolios = 0
        published_portfolios = 0
        ai_generations = 0
        latest_ats = 88

        recent_resumes = []
        recent_versions = []
        ats_trends = []
        recent_portfolios = []
        recent_activities = []

        if db_manager.db is not None:
            # Count user metrics from MongoDB collections
            total_resumes = await db_manager.db["resumes"].count_documents({"user_id": user_id})
            total_versions = await db_manager.db["resume_versions"].count_documents({"user_id": user_id})
            total_portfolios = await db_manager.db["portfolios"].count_documents({"user_id": user_id})
            published_portfolios = await db_manager.db["portfolios"].count_documents({"user_id": user_id, "is_published": True})
            ai_generations = await db_manager.db["ai_history"].count_documents({"user_id": user_id})

            # Fetch recent 5 resumes
            async for r in db_manager.db["resumes"].find({"user_id": user_id}).sort("updated_at", -1).limit(5):
                r_id = str(r["_id"])
                v_count = await db_manager.db["resume_versions"].count_documents({"parent_resume_id": r_id, "user_id": user_id})
                recent_resumes.append(RecentResumeItem(
                    id=r_id,
                    title=r.get("title", "Untitled Resume"),
                    target_role=r.get("target_role", "Software Engineer"),
                    template_id=r.get("template_id", "modern_linear"),
                    ats_score=r.get("ats_score", 88),
                    version_count=v_count + 1,
                    updated_at=r.get("updated_at", datetime.now(timezone.utc))
                ))

            # Fetch recent 5 resume child versions
            async for v in db_manager.db["resume_versions"].find({"user_id": user_id}).sort("created_at", -1).limit(5):
                recent_versions.append(RecentVersionItem(
                    id=str(v.get("_id") or v.get("version_id")),
                    parent_resume_id=v.get("parent_resume_id", ""),
                    version_name=v.get("version_name", "Version snapshot"),
                    source=v.get("source", "MANUAL"),
                    company=v.get("company", ""),
                    job_title=v.get("job_title", ""),
                    ats_score=v.get("ats_score", 88),
                    created_at=v.get("created_at", datetime.now(timezone.utc))
                ))

            # Fetch recent ATS trends
            async for a in db_manager.db["ats_analysis_history"].find({"user_id": user_id}).sort("created_at", 1).limit(6):
                ats_trends.append(ATSTrendItem(
                    company=a.get("company") or "Target Corp",
                    job_title=a.get("job_title") or "Role",
                    score=a.get("ats_score", 85),
                    date=a.get("created_at", datetime.now(timezone.utc)).strftime("%b %d")
                ))

            if ats_trends:
                latest_ats = ats_trends[-1].score

            # Fetch recent 5 portfolios
            async for p in db_manager.db["portfolios"].find({"user_id": user_id}).sort("updated_at", -1).limit(5):
                recent_portfolios.append(RecentPortfolioItem(
                    id=str(p["_id"]),
                    title=p.get("title", "My Portfolio"),
                    slug=p.get("slug", "portfolio"),
                    is_published=p.get("is_published", False),
                    template_id=p.get("template_id", "developer_dark"),
                    views_count=p.get("views_count", 0),
                    updated_at=p.get("updated_at", datetime.now(timezone.utc))
                ))

            # Fetch recent activity logs
            async for a in db_manager.db["activities"].find({"user_id": user_id}).sort("timestamp", -1).limit(5):
                recent_activities.append(ActivityItem(
                    id=str(a["_id"]),
                    action=a.get("action", "RESUME_UPDATE"),
                    description=a.get("description", "Updated resume details"),
                    timestamp=a.get("timestamp", datetime.now(timezone.utc))
                ))

        # Default fallback sample data if user hasn't created items yet
        if not ats_trends:
            ats_trends = [
                ATSTrendItem(company="Google", job_title="Lead Cloud Engineer", score=91, date="Recent"),
                ATSTrendItem(company="Amazon", job_title="Senior AWS Architect", score=94, date="Recent"),
                ATSTrendItem(company="Microsoft", job_title="Software Architect", score=86, date="Recent"),
                ATSTrendItem(company="Zoho", job_title="Product Developer", score=82, date="Recent"),
            ]

        if not recent_activities:
            recent_activities = [
                ActivityItem(
                    id="act_1",
                    action="WORKSPACE_READY",
                    description="AI Career Operating System activated",
                    timestamp=datetime.now(timezone.utc)
                )
            ]

        return DashboardOverviewResponse(
            metrics=MetricSummary(
                total_resumes=total_resumes,
                total_versions=total_versions,
                total_portfolios=total_portfolios,
                published_portfolios=published_portfolios,
                ai_generations_used=ai_generations,
                latest_ats_score=latest_ats,
                profile_completeness=85 if total_resumes == 0 else 95
            ),
            recent_resumes=recent_resumes,
            recent_versions=recent_versions,
            ats_trends=ats_trends,
            recent_portfolios=recent_portfolios,
            recent_activities=recent_activities
        )
