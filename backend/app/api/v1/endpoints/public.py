from fastapi import APIRouter, Response
from app.schemas.response import APIResponse
from app.services.portfolio_service import PortfolioService
from app.services.seo_service import SEOService

router = APIRouter()


@router.get("/sitemap.xml")
async def get_sitemap():
    """Generate dynamic XML sitemap for public portfolios."""
    xml_content = await SEOService.generate_sitemap_xml()
    return Response(content=xml_content, media_type="application/xml")


@router.get("/robots.txt")
async def get_robots():
    """Return robots.txt rules."""
    robots_content = SEOService.generate_robots_txt()
    return Response(content=robots_content, media_type="text/plain")


@router.get("/portfolios/{slug}", response_model=APIResponse)
async def get_public_portfolio(slug: str):
    """Fetch unauthenticated public portfolio web app."""
    portfolio = await PortfolioService.get_public_portfolio_by_slug(slug)
    return APIResponse.ok(data=portfolio)


@router.get("/portfolios/{slug}/seo", response_model=APIResponse)
async def get_portfolio_seo(slug: str):
    """Fetch Open Graph & Meta Tags for social sharing cards."""
    seo_meta = await SEOService.get_portfolio_seo_meta(slug)
    return APIResponse.ok(data=seo_meta)
