from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from app.models.user import PyObjectId


class SocialLinks(BaseModel):
    github: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    website: Optional[str] = None


class ThemeConfig(BaseModel):
    accent_color: Optional[str] = None
    font_family: Optional[str] = None
    layout_variant: Optional[str] = "standard"  # standard, centered, split
    border_radius: Optional[str] = "md" # none, sm, md, lg, full
    glass_intensity: Optional[str] = "medium" # none, low, medium, high


class PortfolioProject(BaseModel):
    id: str
    title: str
    description: str
    image_url: Optional[str] = None
    image_public_id: Optional[str] = None
    tech_stack: List[str] = []
    github_link: Optional[str] = None
    live_link: Optional[str] = None


class SEOConfig(BaseModel):
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    keywords: List[str] = []


class PortfolioModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    user_id: str
    title: str = "My Career Portfolio"
    slug: str = "my-portfolio"
    custom_domain: Optional[str] = None
    template_id: str = "developer_dark"
    is_published: bool = False
    hero_tagline: str = "Professional Developer & Engineer"
    bio: str = "Building scalable systems and modern web applications."
    avatar_url: Optional[str] = None
    social_links: SocialLinks = Field(default_factory=SocialLinks)
    projects: List[PortfolioProject] = []
    skills: List[str] = ["Python", "FastAPI", "React 19", "TypeScript", "MongoDB", "Groq AI"]
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    certificates: List[Dict[str, Any]] = []
    seo_config: SEOConfig = Field(default_factory=SEOConfig)
    theme_config: ThemeConfig = Field(default_factory=ThemeConfig)
    views_count: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
