from typing import List
from fastapi import APIRouter, Depends, Query
from app.schemas.response import APIResponse
from app.schemas.portfolio import PortfolioCreate, PortfolioUpdate, PortfolioResponse
from app.schemas.analytics import PortfolioAnalyticsResponse
from app.services.portfolio_service import PortfolioService
from app.services.analytics_service import PortfolioAnalyticsService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=APIResponse)
async def create_portfolio(
    data: PortfolioCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a portfolio configuration."""
    portfolio = await PortfolioService.create_portfolio(current_user["id"], data)
    return APIResponse.ok(data=portfolio)


@router.get("", response_model=APIResponse)
async def list_portfolios(current_user: dict = Depends(get_current_user)):
    """List all portfolios belonging to current user."""
    portfolios = await PortfolioService.get_user_portfolios(current_user["id"])
    return APIResponse.ok(data=portfolios)


@router.get("/public/{slug}", response_model=APIResponse)
async def get_public_portfolio(slug: str):
    """Fetch a published portfolio by unique slug (No Auth Required)."""
    portfolio = await PortfolioService.get_public_portfolio(slug)
    return APIResponse.ok(data=portfolio)


@router.get("/{portfolio_id}", response_model=APIResponse)
async def get_portfolio(
    portfolio_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get single portfolio by ID."""
    portfolio = await PortfolioService.get_portfolio_by_id(portfolio_id, current_user["id"])
    return APIResponse.ok(data=portfolio)


@router.get("/{portfolio_id}/analytics", response_model=APIResponse[PortfolioAnalyticsResponse])
async def get_portfolio_analytics(
    portfolio_id: str,
    timeframe: str = Query("30d", pattern="^(7d|30d|1y)$"),
    current_user: dict = Depends(get_current_user)
):
    """Fetch aggregated visitor & traffic analytics for a portfolio."""
    analytics = await PortfolioAnalyticsService.get_analytics(portfolio_id, current_user["id"], timeframe)
    return APIResponse.ok(data=analytics)


@router.put("/{portfolio_id}", response_model=APIResponse)
async def update_portfolio(
    portfolio_id: str,
    data: PortfolioUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update portfolio fields & publication settings."""
    updated = await PortfolioService.update_portfolio(portfolio_id, current_user["id"], data)
    return APIResponse.ok(data=updated)


@router.delete("/{portfolio_id}", response_model=APIResponse)
async def delete_portfolio(
    portfolio_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a portfolio."""
    await PortfolioService.delete_portfolio(portfolio_id, current_user["id"])
    return APIResponse.ok(data={"message": "Portfolio deleted successfully."})
