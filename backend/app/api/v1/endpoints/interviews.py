from fastapi import APIRouter, Depends
from typing import List
from app.schemas.response import APIResponse
from app.schemas.interview import (
    StartInterviewRequest, SubmitAnswerRequest,
    AnswerEvaluation, InterviewSessionItem
)
from app.services.interview_coach_service import InterviewCoachService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.post("/start", response_model=APIResponse)
async def start_interview(
    data: StartInterviewRequest,
    current_user: dict = Depends(get_current_user)
):
    """Start an AI interview session. Generates questions based on mode, role, and difficulty."""
    result = await InterviewCoachService.start_interview(current_user["id"], data)
    return APIResponse.ok(data=result)


@router.post("/evaluate", response_model=APIResponse[AnswerEvaluation])
async def evaluate_answer(
    data: SubmitAnswerRequest,
    current_user: dict = Depends(get_current_user)
):
    """Submit an interview answer for AI evaluation and scoring."""
    evaluation = await InterviewCoachService.evaluate_answer(current_user["id"], data)
    return APIResponse.ok(data=evaluation)


@router.get("/sessions", response_model=APIResponse[List[InterviewSessionItem]])
async def get_sessions(current_user: dict = Depends(get_current_user)):
    """Fetch interview session history with scores."""
    sessions = await InterviewCoachService.get_sessions(current_user["id"])
    return APIResponse.ok(data=sessions)
