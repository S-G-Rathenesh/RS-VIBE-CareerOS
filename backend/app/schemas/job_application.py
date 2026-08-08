from datetime import datetime
from typing import Any, Dict, List, Optional
from enum import Enum
from pydantic import BaseModel, Field


class ApplicationStatus(str, Enum):
    DRAFT = "draft"
    APPLIED = "applied"
    ASSESSMENT = "assessment"
    INTERVIEW = "interview"
    TECHNICAL_INTERVIEW = "technical_interview"
    HR_INTERVIEW = "hr_interview"
    OFFER = "offer"
    REJECTED = "rejected"
    ACCEPTED = "accepted"
    WITHDRAWN = "withdrawn"


class EmploymentType(str, Enum):
    FULL_TIME = "Full-time"
    PART_TIME = "Part-time"
    CONTRACT = "Contract"
    INTERNSHIP = "Internship"
    REMOTE = "Remote"


# ═══════════════════════════════════════════════════════
# Recruiter Models
# ═══════════════════════════════════════════════════════

class RecruiterBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    company: str = Field(..., min_length=1, max_length=100)
    role: Optional[str] = "Technical Recruiter"
    email: Optional[str] = None
    linkedin: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[int] = Field(default=5, ge=1, le=5)
    conversation_notes: Optional[str] = None


class RecruiterCreate(RecruiterBase):
    pass


class RecruiterUpdate(BaseModel):
    name: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    email: Optional[str] = None
    linkedin: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[int] = None
    conversation_notes: Optional[str] = None


class RecruiterResponse(RecruiterBase):
    id: str
    user_id: str
    last_contact: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════════════════════
# Timeline Models
# ═══════════════════════════════════════════════════════

class ApplicationTimelineCreate(BaseModel):
    event_type: str = "STATUS_CHANGE"  # STATUS_CHANGE, NOTE, INTERVIEW_SCHEDULED, EMAIL_SENT, OFFER_RECEIVED
    title: str
    description: Optional[str] = None
    icon: Optional[str] = "clock"
    metadata: Optional[Dict[str, Any]] = None
    date: Optional[datetime] = None


class ApplicationTimelineResponse(BaseModel):
    id: str
    application_id: str
    user_id: str
    event_type: str
    title: str
    description: Optional[str] = None
    icon: str = "clock"
    metadata: Optional[Dict[str, Any]] = None
    date: datetime
    created_at: datetime


# ═══════════════════════════════════════════════════════
# Interview Session Models
# ═══════════════════════════════════════════════════════

class InterviewSessionCreate(BaseModel):
    round_name: str = "Technical Round 1"  # Screening, Technical, System Design, Behavioral, HR, Final
    scheduled_at: Optional[datetime] = None
    interviewer_name: Optional[str] = None
    interviewer_role: Optional[str] = None
    meeting_link: Optional[str] = None
    questions: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    user_notes: Optional[str] = None
    feedback: Optional[str] = None
    weak_areas: Optional[List[str]] = Field(default_factory=list)
    strong_areas: Optional[List[str]] = Field(default_factory=list)
    ai_suggestions: Optional[List[str]] = Field(default_factory=list)
    score: Optional[int] = Field(default=None, ge=0, le=100)


class InterviewSessionResponse(InterviewSessionCreate):
    id: str
    application_id: str
    user_id: str
    created_at: datetime
    updated_at: datetime


# ═══════════════════════════════════════════════════════
# Job Application Models
# ═══════════════════════════════════════════════════════

class JobApplicationBase(BaseModel):
    company: str = Field(..., min_length=1, max_length=150)
    job_title: str = Field(..., min_length=1, max_length=150)
    job_description: Optional[str] = None
    career_page_url: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.APPLIED
    employment_type: Optional[str] = "Full-time"
    location: Optional[str] = "Remote / Hybrid"
    salary: Optional[str] = None
    application_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None

    # Linked Career Assets
    resume_id: Optional[str] = None
    resume_version_id: Optional[str] = None
    resume_version_name: Optional[str] = None
    cover_letter_id: Optional[str] = None
    cover_letter_text: Optional[str] = None
    ats_score: Optional[int] = None
    ats_match_status: Optional[str] = None

    # Recruiter Link
    recruiter_id: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_linkedin: Optional[str] = None

    notes: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)


class JobApplicationCreate(JobApplicationBase):
    pass


class JobApplicationUpdate(BaseModel):
    company: Optional[str] = None
    job_title: Optional[str] = None
    job_description: Optional[str] = None
    career_page_url: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    employment_type: Optional[str] = None
    location: Optional[str] = None
    salary: Optional[str] = None
    application_date: Optional[datetime] = None
    deadline: Optional[datetime] = None
    follow_up_date: Optional[datetime] = None

    resume_id: Optional[str] = None
    resume_version_id: Optional[str] = None
    resume_version_name: Optional[str] = None
    cover_letter_id: Optional[str] = None
    cover_letter_text: Optional[str] = None
    ats_score: Optional[int] = None
    ats_match_status: Optional[str] = None

    recruiter_id: Optional[str] = None
    recruiter_name: Optional[str] = None
    recruiter_email: Optional[str] = None
    recruiter_linkedin: Optional[str] = None

    notes: Optional[str] = None
    tags: Optional[List[str]] = None


class JobApplicationResponse(JobApplicationBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    timeline: Optional[List[ApplicationTimelineResponse]] = Field(default_factory=list)
    interviews: Optional[List[InterviewSessionResponse]] = Field(default_factory=list)


class JobApplicationListResponse(BaseModel):
    applications: List[JobApplicationResponse]
    total_count: int


# ═══════════════════════════════════════════════════════
# 1-Click "Apply With Resume" Pipeline Request
# ═══════════════════════════════════════════════════════

class ApplyWithResumeRequest(BaseModel):
    parent_resume_id: str
    company: str
    job_title: str
    job_description: str
    location: Optional[str] = "Remote"
    salary: Optional[str] = None
    career_page_url: Optional[str] = None
    status: Optional[ApplicationStatus] = ApplicationStatus.APPLIED
    auto_tailor: Optional[bool] = True
    auto_cover_letter: Optional[bool] = True
    auto_interview_prep: Optional[bool] = True


class ApplyWithResumeResponse(BaseModel):
    application_id: str
    company: str
    job_title: str
    resume_version_id: Optional[str] = None
    resume_version_name: Optional[str] = None
    ats_score: int
    cover_letter: Optional[str] = None
    interview_questions_count: int
    status: str
    message: str


# ═══════════════════════════════════════════════════════
# AI Email Generator Models
# ═══════════════════════════════════════════════════════

class EmailType(str, Enum):
    THANK_YOU = "thank_you"
    FOLLOW_UP = "follow_up"
    SALARY_NEGOTIATION = "salary_negotiation"
    ACCEPTANCE = "acceptance"
    DECLINE = "decline"
    REFERRAL_REQUEST = "referral_request"


class EmailGenerateRequest(BaseModel):
    application_id: Optional[str] = None
    email_type: EmailType = EmailType.FOLLOW_UP
    company: str
    job_title: str
    recipient_name: Optional[str] = "Hiring Team"
    key_points: Optional[str] = None
    candidate_name: Optional[str] = None


class EmailGenerateResponse(BaseModel):
    email_type: str
    subject: str
    body: str


# ═══════════════════════════════════════════════════════
# Career Analytics & Insights Models
# ═══════════════════════════════════════════════════════

class CareerAnalyticsResponse(BaseModel):
    total_applications: int
    total_applied: int
    total_interviews: int
    total_offers: int
    total_rejections: int
    acceptance_rate: float
    interview_conversion_rate: float
    average_ats_score: float
    status_breakdown: Dict[str, int]
    top_performing_resumes: List[Dict[str, Any]]
    monthly_trends: List[Dict[str, Any]]
    top_companies: List[Dict[str, Any]]


class CareerInsightResponse(BaseModel):
    insights: List[Dict[str, Any]]
    weekly_summary: str
