from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class MetricSummary(BaseModel):
    total_resumes: int = 0
    total_versions: int = 0
    total_portfolios: int = 0
    published_portfolios: int = 0
    ai_generations_used: int = 0
    latest_ats_score: int = 88
    profile_completeness: int = 90


class RecentResumeItem(BaseModel):
    id: str
    title: str
    target_role: Optional[str] = "Software Engineer"
    template_id: str = "modern_linear"
    ats_score: Optional[int] = 92
    version_count: Optional[int] = 1
    updated_at: datetime


class RecentVersionItem(BaseModel):
    id: str
    parent_resume_id: str
    version_name: str
    source: str
    company: Optional[str] = ""
    job_title: Optional[str] = ""
    ats_score: int = 88
    created_at: datetime


class ATSTrendItem(BaseModel):
    company: str
    job_title: str
    score: int
    date: str


class RecentPortfolioItem(BaseModel):
    id: str
    title: str
    slug: str
    is_published: bool = False
    template_id: str = "developer_dark"
    views_count: int = 0
    updated_at: datetime


class ActivityItem(BaseModel):
    id: str
    action: str
    description: str
    timestamp: datetime


class DashboardOverviewResponse(BaseModel):
    metrics: MetricSummary
    recent_resumes: List[RecentResumeItem] = []
    recent_versions: List[RecentVersionItem] = []
    ats_trends: List[ATSTrendItem] = []
    recent_portfolios: List[RecentPortfolioItem] = []
    recent_activities: List[ActivityItem] = []
