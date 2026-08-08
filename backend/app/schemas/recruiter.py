from pydantic import BaseModel
from typing import List, Optional


class CandidateSearchQuery(BaseModel):
    skills: Optional[List[str]] = None
    location: Optional[str] = None
    experience_years: Optional[int] = None
    job_title: Optional[str] = None


class CandidateItem(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    avatar_url: Optional[str] = None
    headline: Optional[str] = None
    skills: List[str]
    portfolio_url: Optional[str] = None
    resume_count: int


class BookmarkItem(BaseModel):
    id: str
    candidate_id: str
    candidate_name: str
    candidate_email: str
    notes: Optional[str] = None
    bookmarked_at: str


class RecruiterAnalyticsItem(BaseModel):
    total_searches: int
    total_bookmarks: int
    total_downloads: int
    total_contacts: int
