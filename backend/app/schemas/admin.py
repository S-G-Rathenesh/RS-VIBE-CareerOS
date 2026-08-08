from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class SystemMetrics(BaseModel):
    total_users: int = 0
    total_resumes: int = 0
    total_portfolios: int = 0
    published_sites: int = 0
    ai_generations_total: int = 0
    storage_mb: float = 0.0
    active_jobs: int = 0


class AdminUserItem(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    is_email_verified: bool
    created_at: datetime


class AdminAnalyticsResponse(BaseModel):
    metrics: SystemMetrics
    recent_users: List[AdminUserItem] = []
