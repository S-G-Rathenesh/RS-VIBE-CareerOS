from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from app.models.analytics import PortfolioAnalyticsV2, PortfolioSession, PortfolioEvent
from app.database.mongodb import db_manager
from app.core.exceptions import NotFoundException
from app.core.logging import logger

class PortfolioAnalyticsV2Service:
    @staticmethod
    async def log_event(portfolio_id: str, session_id: str, event_data: dict):
        if db_manager.db is None:
            return
            
        event = PortfolioEvent(**event_data)
        
        # Upsert session
        await db_manager.db["portfolio_sessions"].update_one(
            {"session_id": session_id, "portfolio_id": portfolio_id},
            {
                "$setOnInsert": {
                    "started_at": datetime.now(timezone.utc),
                    "device": event_data.get("device", "desktop"),
                    "country": event_data.get("country", "Unknown"),
                    "referrer": event_data.get("referrer", "direct"),
                    "is_returning": event_data.get("is_returning", False)
                },
                "$push": {"events": event.model_dump()},
                "$set": {"ended_at": datetime.now(timezone.utc)}
            },
            upsert=True
        )

    @staticmethod
    async def aggregate_daily_stats(portfolio_id: str, date_str: str) -> Optional[PortfolioAnalyticsV2]:
        """Aggregate stats for a specific day based on sessions."""
        if db_manager.db is None:
            return None
            
        # Example aggregation logic (simplified)
        # In a real app, this would use a MongoDB aggregation pipeline
        sessions = await db_manager.db["portfolio_sessions"].count_documents({"portfolio_id": portfolio_id})
        
        return PortfolioAnalyticsV2(
            portfolio_id=portfolio_id,
            user_id="system", # Needs to be passed or derived
            date=date_str,
            total_visitors=sessions,
            unique_visitors=sessions,
            total_clicks=sessions * 3, # mock
            resume_downloads=sessions // 10 # mock
        )

    @staticmethod
    async def get_analytics(portfolio_id: str) -> List[Dict[str, Any]]:
        if db_manager.db is None:
            return []
            
        stats = []
        cursor = db_manager.db["portfolio_analytics_v2"].find({"portfolio_id": portfolio_id}).sort("date", -1).limit(30)
        
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            stats.append(doc)
            
        return stats
