from datetime import datetime, timezone
from typing import Any, Dict, List
from collections import defaultdict
from app.database.mongodb import db_manager
from app.core.exceptions import InternalServerErrorException
from app.schemas.job_application import CareerAnalyticsResponse


class CareerAnalyticsService:
    @staticmethod
    def _collection():
        if db_manager.db is None:
            raise InternalServerErrorException("Database not connected")
        return db_manager.db["job_applications"]

    @classmethod
    async def get_analytics(cls, user_id: str) -> CareerAnalyticsResponse:
        col = cls._collection()
        apps = await col.find({"user_id": user_id}).to_list(length=1000)

        total_applications = len(apps)
        if total_applications == 0:
            return CareerAnalyticsResponse(
                total_applications=0,
                total_applied=0,
                total_interviews=0,
                total_offers=0,
                total_rejections=0,
                acceptance_rate=0.0,
                interview_conversion_rate=0.0,
                average_ats_score=0.0,
                status_breakdown={
                    "draft": 0, "applied": 0, "assessment": 0, "interview": 0, "offer": 0, "rejected": 0, "accepted": 0
                },
                top_performing_resumes=[],
                monthly_trends=[],
                top_companies=[],
            )

        status_counts: Dict[str, int] = defaultdict(int)
        ats_scores: List[int] = []
        resume_version_stats: Dict[str, Dict[str, Any]] = defaultdict(lambda: {
            "name": "Original Resume",
            "applied": 0,
            "interviews": 0,
            "offers": 0,
            "avg_ats": 0,
            "scores": [],
        })
        company_counts: Dict[str, int] = defaultdict(int)
        monthly_map: Dict[str, Dict[str, int]] = defaultdict(lambda: {"applied": 0, "interviews": 0, "offers": 0})

        for app in apps:
            st = app.get("status", "applied")
            status_counts[st] += 1

            if app.get("ats_score"):
                ats_scores.append(int(app["ats_score"]))

            # Resume version correlation
            v_id = app.get("resume_version_id") or "master"
            v_name = app.get("resume_version_name") or "Master Resume"
            resume_version_stats[v_id]["name"] = v_name
            resume_version_stats[v_id]["applied"] += 1
            if app.get("ats_score"):
                resume_version_stats[v_id]["scores"].append(int(app["ats_score"]))

            if st in ["interview", "technical_interview", "hr_interview"]:
                resume_version_stats[v_id]["interviews"] += 1
            elif st in ["offer", "accepted"]:
                resume_version_stats[v_id]["interviews"] += 1
                resume_version_stats[v_id]["offers"] += 1

            # Company count
            comp = app.get("company", "Other")
            company_counts[comp] += 1

            # Monthly trend
            app_date = app.get("application_date") or app.get("created_at")
            if app_date:
                month_key = app_date.strftime("%b %Y") if hasattr(app_date, "strftime") else "Recent"
                monthly_map[month_key]["applied"] += 1
                if st in ["interview", "technical_interview", "hr_interview"]:
                    monthly_map[month_key]["interviews"] += 1
                elif st in ["offer", "accepted"]:
                    monthly_map[month_key]["offers"] += 1

        total_interviews = (
            status_counts["interview"]
            + status_counts["technical_interview"]
            + status_counts["hr_interview"]
            + status_counts["offer"]
            + status_counts["accepted"]
        )
        total_offers = status_counts["offer"] + status_counts["accepted"]
        total_rejections = status_counts["rejected"] + status_counts["withdrawn"]

        interview_conversion = round((total_interviews / total_applications) * 100, 1) if total_applications else 0.0
        acceptance_rate = round((total_offers / total_applications) * 100, 1) if total_applications else 0.0
        avg_ats = round(sum(ats_scores) / len(ats_scores), 1) if ats_scores else 85.0

        # Process top performing resumes
        top_resumes: List[Dict[str, Any]] = []
        for vid, stat in resume_version_stats.items():
            scs = stat["scores"]
            v_avg = round(sum(scs) / len(scs), 1) if scs else 85.0
            conv = round((stat["interviews"] / stat["applied"]) * 100, 1) if stat["applied"] else 0.0
            top_resumes.append({
                "version_id": vid,
                "version_name": stat["name"],
                "applied_count": stat["applied"],
                "interview_count": stat["interviews"],
                "offer_count": stat["offers"],
                "conversion_rate": conv,
                "average_ats": v_avg,
            })
        top_resumes.sort(key=lambda x: (x["offer_count"], x["interview_count"], x["conversion_rate"]), reverse=True)

        # Monthly trends
        monthly_trends = [{"month": k, **v} for k, v in monthly_map.items()]

        # Top companies
        top_companies = [{"company": k, "applications": v} for k, v in sorted(company_counts.items(), key=lambda x: x[1], reverse=True)[:6]]

        return CareerAnalyticsResponse(
            total_applications=total_applications,
            total_applied=status_counts["applied"],
            total_interviews=total_interviews,
            total_offers=total_offers,
            total_rejections=total_rejections,
            acceptance_rate=acceptance_rate,
            interview_conversion_rate=interview_conversion,
            average_ats_score=avg_ats,
            status_breakdown=dict(status_counts),
            top_performing_resumes=top_resumes[:5],
            monthly_trends=monthly_trends,
            top_companies=top_companies,
        )
