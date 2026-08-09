from typing import Dict, Any, List
from app.database.mongodb import db_manager
from app.core.config import settings


class SEOService:
    @staticmethod
    async def generate_sitemap_xml() -> str:
        base_url = settings.FRONTEND_URL.rstrip('/')
        urls = [
            f"{base_url}"
        ]

        if db_manager.db is not None:
            cursor = db_manager.db["portfolios"].find({"is_published": True}, {"slug": 1, "updated_at": 1})
            async for doc in cursor:
                if doc.get("slug"):
                    urls.append(f"{base_url}/p/{doc['slug']}")

        xml_lines = [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        ]
        for url in urls:
            xml_lines.append(f'  <url><loc>{url}</loc><changefreq>weekly</changefreq></url>')
        xml_lines.append('</urlset>')

        return "\n".join(xml_lines)

    @staticmethod
    def generate_robots_txt() -> str:
        base_url = settings.FRONTEND_URL.rstrip('/')
        return (
            "User-agent: *\n"
            "Allow: /\n"
            "Disallow: /admin\n"
            "Disallow: /settings\n"
            f"Sitemap: {base_url}/sitemap.xml\n"
        )

    @staticmethod
    async def get_portfolio_seo_meta(slug: str) -> Dict[str, Any]:
        title = "Developer Portfolio | RS VIBE CareerOS"
        description = "View AI-optimized developer portfolio, projects, and tech stack."
        base_url = settings.FRONTEND_URL.rstrip('/')

        if db_manager.db is not None:
            portfolio = await db_manager.db["portfolios"].find_one({"slug": slug, "is_published": True})
            if portfolio:
                title = f"{portfolio.get('title', 'Portfolio')} | RS VIBE CareerOS"
                description = portfolio.get("tagline", description)

        return {
            "title": title,
            "description": description,
            "canonical_url": f"{base_url}/p/{slug}",
            "og_type": "profile",
            "og_title": title,
            "og_description": description,
            "og_image": f"{base_url}/og-preview.png",
            "twitter_card": "summary_large_image",
            "robots": "index, follow"
        }
