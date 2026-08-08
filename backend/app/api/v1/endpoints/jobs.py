from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.security.dependencies import get_current_user
from app.schemas.response import APIResponse
from app.schemas.job_application import (
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationResponse,
    ApplicationStatus,
    ApplyWithResumeRequest,
    ApplyWithResumeResponse,
    ApplicationTimelineCreate,
    InterviewSessionCreate,
    RecruiterCreate,
    RecruiterUpdate,
    EmailGenerateRequest,
    EmailGenerateResponse,
    CareerAnalyticsResponse,
    CareerInsightResponse,
)
from app.services.job_application_service import JobApplicationService
from app.services.recruiter_service import RecruiterService
from app.services.interview_session_service import InterviewSessionService
from app.services.career_email_service import CareerEmailService
from app.services.career_analytics_service import CareerAnalyticsService
from app.services.career_insight_service import CareerInsightService

router = APIRouter()


# ═══════════════════════════════════════════════════════
# 1. Job Application Workspaces
# ═══════════════════════════════════════════════════════

@router.get("", response_model=APIResponse[List[Dict[str, Any]]])
async def list_applications(
    status: Optional[str] = Query(None, description="Filter by application status"),
    company: Optional[str] = Query(None, description="Filter by company name"),
    search: Optional[str] = Query(None, description="Search term across company, title, tags"),
    limit: int = Query(100, ge=1, le=500),
    skip: int = Query(0, ge=0),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """List all job applications belonging to the authenticated user."""
    apps = await JobApplicationService.list_applications(
        user_id=current_user["id"],
        status=status,
        company=company,
        search=search,
        limit=limit,
        skip=skip,
    )
    return APIResponse.respond(data=apps, message="Applications retrieved successfully")


@router.post("", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_201_CREATED)
async def create_application(
    req: JobApplicationCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new job application workspace."""
    app_doc = await JobApplicationService.create_application(current_user["id"], req)
    return APIResponse.respond(data=app_doc, message="Job application workspace created successfully")


@router.get("/kanban", response_model=APIResponse[Dict[str, List[Dict[str, Any]]]])
async def get_kanban_board(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get applications grouped into Kanban columns."""
    board = await JobApplicationService.get_kanban_board(current_user["id"])
    return APIResponse.respond(data=board, message="Kanban board retrieved")


@router.get("/calendar", response_model=APIResponse[List[Dict[str, Any]]])
async def get_calendar_events(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get aggregated dates for calendar tracking."""
    events = await JobApplicationService.get_calendar_events(current_user["id"])
    return APIResponse.respond(data=events, message="Calendar events retrieved")


@router.post("/apply-workflow", response_model=APIResponse[ApplyWithResumeResponse])
async def apply_with_resume_workflow(
    req: ApplyWithResumeRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """1-Click 'Apply with This Resume' end-to-end automation pipeline."""
    result = await JobApplicationService.apply_with_resume_pipeline(current_user["id"], req)
    return APIResponse.respond(data=result, message="Application pipeline completed successfully")


@router.get("/analytics", response_model=APIResponse[CareerAnalyticsResponse])
async def get_career_analytics(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve comprehensive career CRM analytics and conversion metrics."""
    analytics = await CareerAnalyticsService.get_analytics(current_user["id"])
    return APIResponse.respond(data=analytics, message="Career analytics computed successfully")


@router.get("/insights", response_model=APIResponse[CareerInsightResponse])
async def get_career_insights(
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve AI-synthesized weekly career insights and performance advice."""
    insights = await CareerInsightService.get_insights(current_user["id"])
    return APIResponse.respond(data=insights, message="Career insights synthesized successfully")


@router.post("/generate-email", response_model=APIResponse[EmailGenerateResponse])
async def generate_career_email(
    req: EmailGenerateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """AI generator for Thank You, Follow-up, Salary Negotiation, and Referral emails."""
    email_doc = await CareerEmailService.generate_email(req)
    return APIResponse.respond(data=email_doc, message="Email drafted successfully")


# ═══════════════════════════════════════════════════════
# Recruiter CRM Endpoints
# ═══════════════════════════════════════════════════════

@router.get("/recruiters", response_model=APIResponse[List[Dict[str, Any]]])
async def list_recruiters(
    company: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """List recruiter directory."""
    recs = await RecruiterService.list_recruiters(current_user["id"], company)
    return APIResponse.respond(data=recs, message="Recruiters retrieved")


@router.post("/recruiters", response_model=APIResponse[Dict[str, Any]], status_code=status.HTTP_201_CREATED)
async def create_recruiter(
    req: RecruiterCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a recruiter profile."""
    rec = await RecruiterService.create_recruiter(current_user["id"], req)
    return APIResponse.respond(data=rec, message="Recruiter profile created")


@router.put("/recruiters/{recruiter_id}", response_model=APIResponse[Dict[str, Any]])
async def update_recruiter(
    recruiter_id: str,
    req: RecruiterUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update a recruiter profile."""
    rec = await RecruiterService.update_recruiter(recruiter_id, current_user["id"], req)
    return APIResponse.respond(data=rec, message="Recruiter profile updated")


@router.delete("/recruiters/{recruiter_id}", response_model=APIResponse[Dict[str, Any]])
async def delete_recruiter(
    recruiter_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Delete a recruiter profile."""
    await RecruiterService.delete_recruiter(recruiter_id, current_user["id"])
    return APIResponse.respond(data={"deleted": True}, message="Recruiter deleted")


# ═══════════════════════════════════════════════════════
# Single Application Workspace Endpoints
# ═══════════════════════════════════════════════════════

@router.get("/{application_id}", response_model=APIResponse[Dict[str, Any]])
async def get_application(
    application_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Get full application workspace."""
    app_doc = await JobApplicationService.get_application(application_id, current_user["id"])
    return APIResponse.respond(data=app_doc, message="Application workspace retrieved")


@router.put("/{application_id}", response_model=APIResponse[Dict[str, Any]])
async def update_application(
    application_id: str,
    req: JobApplicationUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Update application workspace fields."""
    updated = await JobApplicationService.update_application(application_id, current_user["id"], req)
    return APIResponse.respond(data=updated, message="Application updated")


@router.put("/{application_id}/status", response_model=APIResponse[Dict[str, Any]])
async def update_application_status(
    application_id: str,
    status_val: ApplicationStatus = Query(..., description="Target status"),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Quick update stage for Kanban drag and drop."""
    updated = await JobApplicationService.update_status(application_id, current_user["id"], status_val)
    return APIResponse.respond(data=updated, message=f"Application stage changed to {status_val.value}")


@router.delete("/{application_id}", response_model=APIResponse[Dict[str, Any]])
async def delete_application(
    application_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Delete application workspace."""
    await JobApplicationService.delete_application(application_id, current_user["id"])
    return APIResponse.respond(data={"deleted": True}, message="Application workspace deleted")


@router.post("/{application_id}/timeline", response_model=APIResponse[Dict[str, Any]])
async def add_timeline_entry(
    application_id: str,
    req: ApplicationTimelineCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Add a custom timeline entry or note."""
    event = await JobApplicationService.add_timeline_event(
        user_id=current_user["id"],
        application_id=application_id,
        event_type=req.event_type,
        title=req.title,
        description=req.description,
        icon=req.icon or "clock",
        metadata=req.metadata,
        date=req.date,
    )
    return APIResponse.respond(data=event, message="Timeline entry logged")


# ═══════════════════════════════════════════════════════
# Application Interview Sessions
# ═══════════════════════════════════════════════════════

@router.get("/{application_id}/interviews", response_model=APIResponse[List[Dict[str, Any]]])
async def list_interview_sessions(
    application_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """List all interview rounds logged for an application."""
    sessions = await InterviewSessionService.list_sessions(current_user["id"], application_id)
    return APIResponse.respond(data=sessions, message="Interview sessions retrieved")


@router.post("/{application_id}/interviews", response_model=APIResponse[Dict[str, Any]])
async def create_interview_session(
    application_id: str,
    req: InterviewSessionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new interview session round."""
    session = await InterviewSessionService.create_session(current_user["id"], application_id, req)
    return APIResponse.respond(data=session, message="Interview session created")
