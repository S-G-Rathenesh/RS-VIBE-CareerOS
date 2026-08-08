from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class SEOProfile(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: str
    portfolio_id: str
    meta_title: str = ""
    meta_description: str = ""
    keywords: List[str] = []
    open_graph: Dict[str, Any] = {}  # og:title, og:image, etc.
    twitter_cards: Dict[str, Any] = {}
    json_ld: Dict[str, Any] = {}
    canonical_url: str = ""
    robots: str = "index, follow"
    sitemap_url: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
