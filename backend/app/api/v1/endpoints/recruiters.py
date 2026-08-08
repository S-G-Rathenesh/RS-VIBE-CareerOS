from fastapi import APIRouter, Depends
from typing import List
from app.schemas.response import APIResponse
from app.schemas.recruiter import CandidateSearchQuery, CandidateItem, BookmarkItem, RecruiterAnalyticsItem
from app.services.recruiter_service import RecruiterService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.post("/search", response_model=APIResponse[List[CandidateItem]])
async def search_candidates(
    query: CandidateSearchQuery,
    current_user: dict = Depends(get_current_user)
):
    """Search candidate profiles by skills, job title, or location."""
    candidates = await RecruiterService.search_candidates(query)
    return APIResponse.ok(data=candidates)


@router.get("/bookmarks", response_model=APIResponse[List[BookmarkItem]])
async def get_bookmarks(current_user: dict = Depends(get_current_user)):
    """Get bookmarked candidates."""
    bookmarks = await RecruiterService.get_bookmarks(current_user["id"])
    return APIResponse.ok(data=bookmarks)


@router.post("/bookmarks/{candidate_id}", response_model=APIResponse[BookmarkItem])
async def bookmark_candidate(
    candidate_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Bookmark a candidate profile."""
    bookmark = await RecruiterService.bookmark_candidate(current_user["id"], candidate_id)
    return APIResponse.ok(data=bookmark)


@router.get("/analytics", response_model=APIResponse[RecruiterAnalyticsItem])
async def get_analytics(current_user: dict = Depends(get_current_user)):
    """Get recruiter activity analytics."""
    analytics = await RecruiterService.get_analytics(current_user["id"])
    return APIResponse.ok(data=analytics)
