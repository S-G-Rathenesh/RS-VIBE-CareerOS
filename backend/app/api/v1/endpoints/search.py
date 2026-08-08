from fastapi import APIRouter, Depends, Query
from typing import List, Dict, Any
from app.security.dependencies import get_current_user
from app.database.mongodb import db_manager
from app.schemas.response import APIResponse
from app.models.user import User

router = APIRouter()

@router.get("", response_model=APIResponse)
async def global_search(
    q: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user)
):
    """
    Search across Resumes, Portfolios, and Job Applications for the current user.
    """
    user_id = str(current_user.get("id") or current_user.get("_id") or "")
    query_regex = {"$regex": q, "$options": "i"}
    
    results = []

    # 1. Search Resumes (title, target_role, template_id)
    resumes_cursor = db_manager.db.resumes.find({
        "user_id": user_id,
        "$or": [
            {"title": query_regex},
            {"target_role": query_regex},
            {"template_id": query_regex}
        ]
    }).limit(5)
    
    async for resume in resumes_cursor:
        results.append({
            "id": str(resume.get("_id", resume.get("id"))),
            "title": resume.get("title", "Untitled Resume"),
            "type": "resume",
            "subtitle": resume.get("target_role", "Resume")
        })

    # 2. Search Portfolios (title, slug, tagline)
    portfolios_cursor = db_manager.db.portfolios.find({
        "user_id": user_id,
        "$or": [
            {"title": query_regex},
            {"slug": query_regex},
            {"tagline": query_regex}
        ]
    }).limit(5)
    
    async for portfolio in portfolios_cursor:
        results.append({
            "id": str(portfolio.get("_id", portfolio.get("id"))),
            "title": portfolio.get("title", "Untitled Portfolio"),
            "type": "portfolio",
            "subtitle": portfolio.get("slug", "Portfolio")
        })

    # 3. Search Job Applications (company, job_title)
    jobs_cursor = db_manager.db.job_applications.find({
        "user_id": user_id,
        "$or": [
            {"company": query_regex},
            {"job_title": query_regex}
        ]
    }).limit(5)
    
    async for job in jobs_cursor:
        results.append({
            "id": str(job.get("_id", job.get("id"))),
            "title": f"{job.get('company', 'Unknown')} - {job.get('job_title', 'Role')}",
            "type": "job",
            "subtitle": job.get("status", "Applied")
        })

    return APIResponse.respond(data=results)
