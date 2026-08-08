from fastapi import APIRouter, Depends, Body
from typing import Dict, Any, List
from app.schemas.response import APIResponse
from app.models.user import UserModel
from app.security.dependencies import get_current_user
from app.services.company_job_service import CompanyService, JobPostService
from app.services.hiring_pipeline_service import (
    CandidateSearchService, CandidateMatchService, 
    HiringPipelineService, InterviewSchedulerService, 
    MessagingService, AIRecruiterAssistantService
)

router = APIRouter()

def get_current_recruiter(current_user: UserModel = Depends(get_current_user)):
    # if current_user.role != "recruiter":
    #     raise HTTPException(status_code=403, detail="Not authorized as recruiter")
    # MVP: allow anyone to test the recruiter hub
    return current_user

@router.post("/company", response_model=APIResponse)
async def create_company(
    data: dict = Body(...),
    recruiter: UserModel = Depends(get_current_recruiter)
):
    company = await CompanyService.create_company(data)
    return APIResponse.ok(data=company)

@router.post("/jobs", response_model=APIResponse)
async def create_job(
    data: dict = Body(...),
    recruiter: UserModel = Depends(get_current_recruiter)
):
    data["recruiter_id"] = recruiter.id
    job = await JobPostService.create_job_post(data)
    return APIResponse.ok(data=job)

@router.get("/jobs", response_model=APIResponse)
async def get_jobs(
    company_id: str,
    recruiter: UserModel = Depends(get_current_recruiter)
):
    jobs = await JobPostService.get_jobs_by_company(company_id)
    return APIResponse.ok(data=jobs)

@router.post("/search", response_model=APIResponse)
async def search_candidates(
    filters: dict = Body(...),
    recruiter: UserModel = Depends(get_current_recruiter)
):
    candidates = await CandidateSearchService.search_candidates(filters)
    return APIResponse.ok(data=candidates)

@router.post("/match", response_model=APIResponse)
async def match_candidate(
    job_id: str = Body(...),
    candidate_id: str = Body(...),
    recruiter: UserModel = Depends(get_current_recruiter)
):
    match = await CandidateMatchService.evaluate_candidate(job_id, candidate_id)
    return APIResponse.ok(data=match)

@router.post("/pipeline", response_model=APIResponse)
async def update_pipeline(
    application_id: str = Body(...),
    status: str = Body(...),
    recruiter: UserModel = Depends(get_current_recruiter)
):
    app = await HiringPipelineService.update_status(application_id, status)
    return APIResponse.ok(data=app)
