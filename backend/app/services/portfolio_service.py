from datetime import datetime, timezone
from typing import List, Optional
from app.database.mongodb import db_manager
from app.models.portfolio import PortfolioModel, SocialLinks, PortfolioProject
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate
from app.core.exceptions import NotFoundException, ForbiddenException, ConflictException


class PortfolioService:
    @staticmethod
    async def create_portfolio(user_id: str, data: PortfolioCreate) -> dict:
        clean_slug = data.slug.lower().strip().replace(" ", "-")

        if db_manager.db is not None:
            existing = await db_manager.db["portfolios"].find_one({"slug": clean_slug})
            if existing and existing["user_id"] != user_id:
                clean_slug = f"{clean_slug}-{user_id[:4]}"

        portfolio_obj = PortfolioModel(
            user_id=user_id,
            title=data.title,
            slug=clean_slug,
            template_id=data.template_id,
            social_links=SocialLinks(
                github="https://github.com",
                linkedin="https://linkedin.com",
                website="https://exploreme.ai"
            ),
            projects=[
                PortfolioProject(
                    id="p_1",
                    title="RS VIBE CareerOS SaaS",
                    description="AI-powered Career, Resume & Portfolio Platform.",
                    tech_stack=["Python", "FastAPI", "React 19", "Groq AI", "MongoDB"],
                    github_link="https://github.com",
                    live_link="https://exploreme.ai"
                )
            ]
        )
        portfolio_dict = portfolio_obj.model_dump(by_alias=True)

        if db_manager.db is not None:
            await db_manager.db["portfolios"].insert_one(portfolio_dict)

        portfolio_dict["id"] = str(portfolio_dict["_id"])
        return portfolio_dict

    @staticmethod
    async def get_user_portfolios(user_id: str) -> List[dict]:
        portfolios = []
        if db_manager.db is not None:
            async for p in db_manager.db["portfolios"].find({"user_id": user_id}).sort("updated_at", -1):
                p["id"] = str(p["_id"])
                portfolios.append(p)
        return portfolios

    @staticmethod
    async def get_portfolio_by_id(portfolio_id: str, user_id: str) -> dict:
        if db_manager.db is not None:
            portfolio = await db_manager.db["portfolios"].find_one({"_id": portfolio_id})
            if not portfolio:
                raise NotFoundException(message="Portfolio not found")
            if portfolio["user_id"] != user_id:
                raise ForbiddenException(message="Access forbidden")
            portfolio["id"] = str(portfolio["_id"])
            return portfolio

        # Fallback stub for development
        return {
            "id": portfolio_id,
            "user_id": user_id,
            "title": "Alex Vance Developer Portfolio",
            "slug": "alexvance",
            "template_id": "developer_dark",
            "is_published": True,
            "hero_tagline": "Senior Full Stack Engineer & AI Systems Architect",
            "bio": "Building high-throughput microservices, scalable distributed cloud architectures, and modern web applications.",
            "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
            "social_links": {
                "github": "https://github.com/alexvance",
                "linkedin": "https://linkedin.com/in/alexvance",
                "twitter": "https://twitter.com/alexvance",
                "website": "https://alexvance.dev"
            },
            "projects": [
                {
                    "id": "p_1",
                    "title": "RS VIBE CareerOS Career Engine",
                    "description": "Production-grade AI Career platform with drag-and-drop resume canvas, Groq ATS match scoring, and public portfolio publishing.",
                    "tech_stack": ["Python", "FastAPI", "React 19", "Groq AI", "MongoDB", "Tailwind CSS"],
                    "github_link": "https://github.com/alexvance/exploreme-ai",
                    "live_link": "https://exploreme.ai"
                }
            ],
            "skills": ["Python", "FastAPI", "React 19", "TypeScript", "Groq AI", "MongoDB", "Cloudinary", "Docker"],
            "experience": [
                {
                    "company": "Vance Tech Labs",
                    "position": "Lead Software Architect",
                    "duration": "2022 - Present",
                    "description": "Engineering multi-tenant cloud platforms serving millions of API requests."
                }
            ],
            "education": [
                {
                    "institution": "Stanford University",
                    "degree": "B.S. Computer Science",
                    "duration": "2016 - 2020"
                }
            ],
            "certificates": [
                {"name": "AWS Certified Solutions Architect", "issuer": "AWS", "date": "2023"}
            ],
            "seo_config": {
                "meta_title": "Alex Vance | Senior Full Stack Engineer & AI Architect",
                "meta_description": "Official portfolio website of Alex Vance showcasing AI projects and engineering experience.",
                "keywords": ["Software Engineer", "Full Stack", "FastAPI", "React", "AI Architect"]
            },
            "theme_config": {"accent_color": "#6366f1", "dark_mode": True},
            "views_count": 142,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }

    @staticmethod
    async def get_public_portfolio(slug: str) -> dict:
        """Fetch published portfolio by unique slug and increment views count."""
        if db_manager.db is not None:
            portfolio = await db_manager.db["portfolios"].find_one({"slug": slug, "is_published": True})
            if not portfolio:
                raise NotFoundException(message="Published portfolio not found or currently offline")

            # Increment views count asynchronously
            await db_manager.db["portfolios"].update_one(
                {"_id": portfolio["_id"]},
                {"$inc": {"views_count": 1}}
            )

            portfolio["id"] = str(portfolio["_id"])
            return portfolio

        # Fallback stub for public link preview in dev mode
        return await PortfolioService.get_portfolio_by_id("dev_id", "demo_user")

    @staticmethod
    async def update_portfolio(portfolio_id: str, user_id: str, data: PortfolioUpdate) -> dict:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        update_dict["updated_at"] = datetime.now(timezone.utc)

        if db_manager.db is not None:
            portfolio = await db_manager.db["portfolios"].find_one({"_id": portfolio_id})
            if not portfolio:
                raise NotFoundException(message="Portfolio not found")
            if portfolio["user_id"] != user_id:
                raise ForbiddenException(message="Access forbidden")

            await db_manager.db["portfolios"].update_one(
                {"_id": portfolio_id},
                {"$set": update_dict}
            )

        return update_dict

    @staticmethod
    async def delete_portfolio(portfolio_id: str, user_id: str) -> bool:
        if db_manager.db is not None:
            await db_manager.db["portfolios"].delete_one({"_id": portfolio_id, "user_id": user_id})
        return True
