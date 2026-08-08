from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class InterviewMode(str, Enum):
    HR = "hr"
    TECHNICAL = "technical"
    BEHAVIORAL = "behavioral"
    SYSTEM_DESIGN = "system_design"
    CODING = "coding"
    RESUME_BASED = "resume_based"


class StartInterviewRequest(BaseModel):
    mode: InterviewMode
    target_role: str
    target_company: Optional[str] = ""
    difficulty: Optional[str] = "medium"  # "easy", "medium", "hard"


class SubmitAnswerRequest(BaseModel):
    session_id: str
    question_id: str
    answer: str


class InterviewQuestion(BaseModel):
    id: str
    question: str
    category: str
    difficulty: str
    tips: Optional[str] = None


class AnswerEvaluation(BaseModel):
    score: int  # 0-100
    feedback: str
    strengths: List[str]
    improvements: List[str]
    sample_answer: str


class InterviewSessionItem(BaseModel):
    id: str
    mode: str
    target_role: str
    target_company: str
    questions_count: int
    average_score: float
    status: str  # "in_progress", "completed"
    created_at: str
