from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class PortfolioEvent(BaseModel):
    event_type: str  # "view", "click", "download_resume", "contact_form"
    path: str
    target_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PortfolioSession(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    portfolio_id: str
    user_id: str
    session_id: str
    device: str = "desktop" # desktop, mobile, tablet
    browser: str = "unknown"
    country: str = "Unknown"
    referrer: str = "direct"
    events: List[PortfolioEvent] = []
    time_on_page: int = 0
    is_returning: bool = False
    started_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ended_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class PortfolioAnalyticsV2(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    portfolio_id: str
    user_id: str
    date: str  # YYYY-MM-DD
    total_visitors: int = 0
    unique_visitors: int = 0
    total_clicks: int = 0
    resume_downloads: int = 0
    avg_time_on_page: float = 0.0
    device_breakdown: Dict[str, int] = {"desktop": 0, "mobile": 0, "tablet": 0}
    country_breakdown: Dict[str, int] = {}
    referrer_breakdown: Dict[str, int] = {}
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
