from typing import List, Dict, Any
from pydantic import BaseModel


class VisitorBreakdown(BaseModel):
    name: str
    count: int
    percentage: float


class TimeSeriesDataPoint(BaseModel):
    date: str
    views: int
    unique_visitors: int
    downloads: int


class PortfolioAnalyticsResponse(BaseModel):
    total_views: int
    unique_visitors: int
    resume_downloads: int
    avg_session_duration_seconds: int
    timeframe: str
    time_series: List[TimeSeriesDataPoint] = []
    top_countries: List[VisitorBreakdown] = []
    top_devices: List[VisitorBreakdown] = []
    top_operating_systems: List[VisitorBreakdown] = []
    top_browsers: List[VisitorBreakdown] = []
    top_referrers: List[VisitorBreakdown] = []
