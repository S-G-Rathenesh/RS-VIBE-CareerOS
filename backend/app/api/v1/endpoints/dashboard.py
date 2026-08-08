from fastapi import APIRouter, Depends
from app.schemas.response import APIResponse
from app.schemas.dashboard import DashboardOverviewResponse
from app.services.dashboard_service import DashboardService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.get("/overview", response_model=APIResponse[DashboardOverviewResponse])
async def get_dashboard_overview(current_user: dict = Depends(get_current_user)):
    """Fetch aggregated user metrics, recent resumes, portfolios, and activity log."""
    overview = await DashboardService.get_overview(current_user["id"])
    return APIResponse.ok(data=overview)
