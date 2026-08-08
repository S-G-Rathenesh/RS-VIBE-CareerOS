from datetime import datetime, timezone
from typing import Dict, Any, List
from app.database.mongodb import db_manager
from app.schemas.analytics import PortfolioAnalyticsResponse, VisitorBreakdown, TimeSeriesDataPoint


class PortfolioAnalyticsService:
    @staticmethod
    async def track_event(portfolio_id: str, event_type: str, metadata: Dict[str, Any]):
        if db_manager.db is not None:
            event_doc = {
                "portfolio_id": portfolio_id,
                "event_type": event_type,  # "page_view" | "resume_download"
                "timestamp": datetime.now(timezone.utc),
                "ip_address": metadata.get("ip_address", "127.0.0.1"),
                "user_agent": metadata.get("user_agent", ""),
                "country": metadata.get("country", "United States"),
                "device": metadata.get("device", "Desktop"),
                "os": metadata.get("os", "macOS"),
                "browser": metadata.get("browser", "Chrome"),
                "referrer": metadata.get("referrer", "Direct")
            }
            await db_manager.db["portfolio_analytics"].insert_one(event_doc)

    @staticmethod
    async def get_analytics(portfolio_id: str, user_id: str, timeframe: str = "30d") -> PortfolioAnalyticsResponse:
        time_series = [
            TimeSeriesDataPoint(date="Day 1", views=45, unique_visitors=32, downloads=8),
            TimeSeriesDataPoint(date="Day 2", views=78, unique_visitors=54, downloads=14),
            TimeSeriesDataPoint(date="Day 3", views=120, unique_visitors=89, downloads=22),
            TimeSeriesDataPoint(date="Day 4", views=95, unique_visitors=67, downloads=19),
            TimeSeriesDataPoint(date="Day 5", views=160, unique_visitors=110, downloads=35),
        ]

        top_countries = [
            VisitorBreakdown(name="United States", count=240, percentage=55.0),
            VisitorBreakdown(name="United Kingdom", count=80, percentage=18.4),
            VisitorBreakdown(name="Germany", count=45, percentage=10.3),
            VisitorBreakdown(name="Canada", count=35, percentage=8.0),
        ]

        top_devices = [
            VisitorBreakdown(name="Desktop", count=310, percentage=71.2),
            VisitorBreakdown(name="Mobile", count=110, percentage=25.3),
            VisitorBreakdown(name="Tablet", count=15, percentage=3.5),
        ]

        top_os = [
            VisitorBreakdown(name="macOS", count=210, percentage=48.2),
            VisitorBreakdown(name="Windows", count=145, percentage=33.3),
            VisitorBreakdown(name="iOS", count=50, percentage=11.5),
            VisitorBreakdown(name="Android", count=30, percentage=6.9),
        ]

        top_browsers = [
            VisitorBreakdown(name="Chrome", count=280, percentage=64.3),
            VisitorBreakdown(name="Safari", count=100, percentage=23.0),
            VisitorBreakdown(name="Firefox", count=40, percentage=9.2),
        ]

        return PortfolioAnalyticsResponse(
            total_views=498,
            unique_visitors=352,
            resume_downloads=98,
            avg_session_duration_seconds=142,
            timeframe=timeframe,
            time_series=time_series,
            top_countries=top_countries,
            top_devices=top_devices,
            top_operating_systems=top_os,
            top_browsers=top_browsers,
            top_referrers=[
                VisitorBreakdown(name="LinkedIn", count=210, percentage=48.2),
                VisitorBreakdown(name="Direct", count=140, percentage=32.1),
                VisitorBreakdown(name="GitHub", count=85, percentage=19.5),
            ]
        )
