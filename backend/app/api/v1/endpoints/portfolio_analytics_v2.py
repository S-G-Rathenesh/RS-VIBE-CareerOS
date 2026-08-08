from fastapi import APIRouter, Depends, Body
from typing import List, Dict, Any
from app.schemas.response import APIResponse
from app.services.portfolio_analytics_v2_service import PortfolioAnalyticsV2Service
from app.security.dependencies import get_current_user

router = APIRouter()


@router.get("/{portfolio_id}", response_model=APIResponse[List[Dict[str, Any]]])
async def get_portfolio_analytics(portfolio_id: str, current_user: dict = Depends(get_current_user)):
    stats = await PortfolioAnalyticsV2Service.get_analytics(portfolio_id)
    return APIResponse.ok(data=stats)


@router.post("/{portfolio_id}/events", response_model=APIResponse[bool])
async def log_portfolio_event(
    portfolio_id: str,
    session_id: str = Body(..., embed=True),
    event_data: dict = Body(..., embed=True)
):
    # Public for visitors, no auth required
    await PortfolioAnalyticsV2Service.log_event(portfolio_id, session_id, event_data)
    return APIResponse.ok(data=True)
