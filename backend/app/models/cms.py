from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId
from app.models.portfolio import PortfolioModel

class PortfolioVersion(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: str
    portfolio_id: str
    version_name: str
    status: str = "draft"  # "draft", "published", "archived"
    portfolio_data: PortfolioModel
    scheduled_for: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
