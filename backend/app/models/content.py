from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class PortfolioPost(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: str
    portfolio_id: Optional[str] = None
    type: str  # "linkedin", "twitter", "blog", "announcement"
    content: str
    platforms: List[str] = []
    status: str = "draft"  # "draft", "published", "scheduled"
    scheduled_for: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
