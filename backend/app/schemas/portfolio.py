from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from app.models.portfolio import SocialLinks, PortfolioProject, SEOConfig


class PortfolioCreate(BaseModel):
    title: str = "My Developer Portfolio"
    slug: str = "developer-profile"
    template_id: str = "developer_dark"


class PortfolioUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    custom_domain: Optional[str] = None
    template_id: Optional[str] = None
    is_published: Optional[bool] = None
    hero_tagline: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    social_links: Optional[SocialLinks] = None
    projects: Optional[List[PortfolioProject]] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    certificates: Optional[List[Dict[str, Any]]] = None
    seo_config: Optional[SEOConfig] = None
    theme_config: Optional[Dict[str, Any]] = None


class PortfolioResponse(BaseModel):
    id: str
    user_id: str
    title: str
    slug: str
    custom_domain: Optional[str] = None
    template_id: str
    is_published: bool
    hero_tagline: str
    bio: str
    avatar_url: Optional[str] = None
    social_links: SocialLinks
    projects: List[PortfolioProject]
    skills: List[str]
    experience: List[Dict[str, Any]]
    education: List[Dict[str, Any]]
    certificates: List[Dict[str, Any]]
    seo_config: SEOConfig
    theme_config: Dict[str, Any]
    views_count: int
    created_at: datetime
    updated_at: datetime
