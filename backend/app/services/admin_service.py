from datetime import datetime, timezone
from typing import List
from app.database.mongodb import db_manager
from app.schemas.admin import AdminAnalyticsResponse, SystemMetrics, AdminUserItem
from app.core.exceptions import NotFoundException


class AdminService:
    @staticmethod
    async def get_analytics() -> AdminAnalyticsResponse:
        total_users = 0
        total_resumes = 0
        total_portfolios = 0
        published_sites = 0
        ai_generations = 0
        active_jobs = 0
        storage_mb = 0.0

        recent_users = []

        if db_manager.db is not None:
            total_users = await db_manager.db["users"].count_documents({})
            total_resumes = await db_manager.db["resumes"].count_documents({})
            total_portfolios = await db_manager.db["portfolios"].count_documents({})
            published_sites = await db_manager.db["portfolios"].count_documents({"is_published": True})
            ai_generations = await db_manager.db["ai_history"].count_documents({})
            active_jobs = await db_manager.db["job_applications"].count_documents({})
            
            try:
                db_stats = await db_manager.db.command("dbStats")
                storage_mb = round(db_stats.get("dataSize", 0) / (1024 * 1024), 2)
            except Exception:
                pass

            async for u in db_manager.db["users"].find({}).sort("created_at", -1).limit(10):
                recent_users.append(AdminUserItem(
                    id=str(u["_id"]),
                    email=u["email"],
                    full_name=u["full_name"],
                    role=u.get("role", "user"),
                    is_email_verified=u.get("is_email_verified", True),
                    created_at=u.get("created_at", datetime.now(timezone.utc))
                ))

        if not recent_users:
            recent_users = [
                AdminUserItem(
                    id="user_admin_1",
                    email="admin@exploreme.ai",
                    full_name="System Administrator",
                    role="admin",
                    is_email_verified=True,
                    created_at=datetime.now(timezone.utc)
                )
            ]

        return AdminAnalyticsResponse(
            metrics=SystemMetrics(
                total_users=total_users or 1,
                total_resumes=total_resumes,
                total_portfolios=total_portfolios,
                published_sites=published_sites,
                ai_generations_total=ai_generations,
                active_jobs=active_jobs,
                storage_mb=storage_mb
            ),
            recent_users=recent_users
        )

    @staticmethod
    async def update_user_role(target_user_id: str, new_role: str) -> bool:
        if db_manager.db is not None:
            result = await db_manager.db["users"].update_one(
                {"_id": target_user_id},
                {"$set": {"role": new_role, "updated_at": datetime.now(timezone.utc)}}
            )
            if result.matched_count == 0:
                raise NotFoundException(message="User not found")
        return True

    @staticmethod
    async def delete_user(target_user_id: str) -> bool:
        if db_manager.db is not None:
            await db_manager.db["users"].delete_one({"_id": target_user_id})
            await db_manager.db["resumes"].delete_many({"user_id": target_user_id})
            await db_manager.db["portfolios"].delete_many({"user_id": target_user_id})
        return True
