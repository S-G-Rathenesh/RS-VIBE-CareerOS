from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File
from pydantic import BaseModel
from app.schemas.response import APIResponse
from app.schemas.ai import (
    ATSScoreRequest, 
    ATSScoreResponse, 
    SummaryGenerateRequest, 
    BulletPointOptimizeRequest, 
    CoverLetterGenerateRequest, 
    SkillSuggestRequest, 
    GrammarCheckRequest,
    ExtractTextResponse,
    ResumePreviewResponse
)
from app.schemas.credit import UserCreditBalanceResponse
from app.services.ai_service import AIService
from app.services.credit_service import CreditService
from app.services.ats_history_service import ATSHistoryService
from app.services.cover_letter_history_service import CoverLetterHistoryService
from app.services.recommendation_service import RecommendationService
from app.providers.ai import get_ai_provider
from app.database.mongodb import db_manager
from app.security.dependencies import get_current_user
from app.core.exceptions import APIException
from datetime import datetime, timezone

router = APIRouter()


class InterviewPrepRequest(BaseModel):
    resume_id: Optional[str] = None
    resume_text: Optional[str] = None
    job_title: str = "Software Engineer"
    company: Optional[str] = "Target Company"
    job_description: Optional[str] = None


class CareerRecommendationRequest(BaseModel):
    resume_id: Optional[str] = None
    target_role: Optional[str] = None
    job_description: Optional[str] = None


@router.get("/credits/history", response_model=APIResponse[UserCreditBalanceResponse])
async def get_credit_history(current_user: dict = Depends(get_current_user)):
    """Fetch user credit balance and transaction history."""
    res = await CreditService.get_credit_history(current_user["id"])
    return APIResponse.ok(data=res)


@router.post("/extract-text", response_model=APIResponse[ExtractTextResponse])
async def extract_document_text(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Extract plain text from uploaded PDF or DOCX file."""
    file_bytes = await file.read()
    if not file_bytes:
        raise APIException(status_code=400, message="Uploaded file is empty.")

    raw_text = await AIService.extract_document_text(file_bytes, file.filename or "document.pdf")
    return APIResponse.ok(data={
        "filename": file.filename or "document.pdf",
        "raw_text": raw_text,
        "character_count": len(raw_text)
    })


@router.post("/parse-resume-preview", response_model=APIResponse[ResumePreviewResponse])
async def parse_resume_preview(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Extract and structure resume data from PDF/DOCX for preview without saving to DB."""
    file_bytes = await file.read()
    if not file_bytes:
        raise APIException(status_code=400, message="Uploaded file is empty.")

    preview = await AIService.parse_resume_preview(file_bytes, file.filename or "resume.pdf")
    return APIResponse.ok(data=preview)


@router.post("/ats-score", response_model=APIResponse[ATSScoreResponse])
async def calculate_ats_score(
    req: ATSScoreRequest,
    current_user: dict = Depends(get_current_user)
):
    """Calculate ATS Score & keyword match breakdown and record audit history."""
    await CreditService.deduct_credits(current_user["id"], "ATS_SCORE", f"ATS analysis for {req.target_role or 'role'}")
    res = await AIService.calculate_ats_score(current_user["id"], req)

    # Persist in ATS Analysis History
    await ATSHistoryService.record_analysis(
        user_id=current_user["id"],
        resume_id=req.resume_id,
        resume_title=req.target_role or "Resume Analysis",
        company=req.target_role or "Target Company",
        job_title=req.target_role or "Target Role",
        job_description=req.job_description,
        score=res.score,
        match_status=res.match_status,
        matching_keywords=res.matching_keywords,
        missing_keywords=res.missing_keywords,
        recommendations=res.improvement_recommendations
    )

    return APIResponse.ok(data=res)


# ─── ATS History & Trends ─────────────────────────────────────────────────────

@router.get("/ats-history", response_model=APIResponse[List[dict]])
async def get_ats_history(current_user: dict = Depends(get_current_user)):
    """Retrieve past ATS audit records."""
    history = await ATSHistoryService.get_history(current_user["id"])
    return APIResponse.ok(data=history)


@router.get("/ats-trend", response_model=APIResponse[List[dict]])
async def get_ats_trend(current_user: dict = Depends(get_current_user)):
    """Retrieve ATS match score trends across job applications."""
    trend = await ATSHistoryService.get_score_trend(current_user["id"])
    return APIResponse.ok(data=trend)


@router.delete("/ats-history/{history_id}", response_model=APIResponse)
async def delete_ats_history(
    history_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an ATS analysis record."""
    await ATSHistoryService.delete_entry(current_user["id"], history_id)
    return APIResponse.ok(data={"message": "Audit history deleted."})


# ─── Summary, Cover Letter & Interview Prep ───────────────────────────────────

@router.post("/summary", response_model=APIResponse)
async def generate_summary(
    req: SummaryGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate professional executive resume summary (Deducts 5 AI Credits)."""
    await CreditService.deduct_credits(current_user["id"], "SUMMARY_GEN", f"Summary for {req.job_title}")
    summary = await AIService.generate_summary(current_user["id"], req)
    return APIResponse.ok(data={"summary": summary})


@router.post("/bullet-points", response_model=APIResponse)
async def optimize_bullets(
    req: BulletPointOptimizeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Optimize resume bullet points (Deducts 3 AI Credits)."""
    await CreditService.deduct_credits(current_user["id"], "TEXT_ENHANCEMENT", f"Bullets for {req.target_role or 'role'}")
    bullets = await AIService.optimize_bullets(current_user["id"], req)
    return APIResponse.ok(data={"bullets": bullets})


@router.post("/cover-letter", response_model=APIResponse)
async def generate_cover_letter(
    req: CoverLetterGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate AI tailored cover letter and record to history."""
    await CreditService.deduct_credits(current_user["id"], "COVER_LETTER", f"Cover letter for {req.company_name or 'company'}")
    cover_letter = await AIService.generate_cover_letter(current_user["id"], req)

    # Persist in Cover Letter History
    await CoverLetterHistoryService.record_cover_letter(
        user_id=current_user["id"],
        company_name=req.company_name,
        target_role=req.target_role,
        cover_letter=cover_letter,
        resume_id=req.resume_id,
        job_description=req.job_description
    )

    return APIResponse.ok(data={"cover_letter": cover_letter})


@router.get("/cover-letters", response_model=APIResponse[List[dict]])
async def list_saved_cover_letters(current_user: dict = Depends(get_current_user)):
    """List historical tailored cover letters."""
    letters = await CoverLetterHistoryService.list_cover_letters(current_user["id"])
    return APIResponse.ok(data=letters)


@router.post("/interview-prep", response_model=APIResponse[dict])
async def generate_interview_prep(
    req: InterviewPrepRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate comprehensive interview questions based on resume & job description."""
    await CreditService.deduct_credits(current_user["id"], "INTERVIEW_COACH", f"Interview prep for {req.company}")
    provider = get_ai_provider()

    system_prompt = (
        "You are an Elite Principal Technical Recruiter and Hiring Manager. "
        "Generate 8 targeted interview questions (Technical, Behavioral, HR, System Design) "
        "tailored to the candidate's resume and target role. "
        "For each question provide a category, question text, what the interviewer is looking for, and a model answer tip. "
        "Return JSON format:\n"
        "{\n"
        '  "role": "Target Role",\n'
        '  "company": "Company",\n'
        '  "questions": [\n'
        '    {"category": "Technical", "question": "Explain how you architected...", "looking_for": "Concurrency handling", "model_tip": "Highlight latency reduction"}\n'
        '  ],\n'
        '  "key_topics": ["Distributed Systems", "Leadership", "System Architecture"]\n'
        "}"
    )

    prompt = (
        f"Role: {req.job_title}\nCompany: {req.company}\n"
        f"Job Description: {req.job_description or 'Senior Engineering position'}\n"
        f"Candidate Resume Context: {req.resume_text or 'Software Engineer with cloud experience'}"
    )

    try:
        res_json = await provider.generate_json(prompt, system_prompt=system_prompt)
    except Exception:
        res_json = {
            "role": req.job_title,
            "company": req.company,
            "questions": [
                {
                    "category": "Technical & Architecture",
                    "question": f"How have you designed scalable microservices in your previous experience for high availability?",
                    "looking_for": "Understanding of fault tolerance, caching, and database indexing",
                    "model_tip": "Structure using the STAR framework: Situation, Task, Action, and Quantifiable Metric."
                },
                {
                    "category": "Behavioral & Leadership",
                    "question": "Describe a time when you had to resolve a high-severity production outage or cross-team conflict.",
                    "looking_for": "Ownership, calm under pressure, and effective communication",
                    "model_tip": "Focus on root cause analysis, proactive mitigation, and team post-mortems."
                },
                {
                    "category": "Project Deep-Dive",
                    "question": f"Walk me through the most technically challenging project on your resume and your key architectural decisions.",
                    "looking_for": "Depth of expertise, trade-offs evaluated, and tech stack justifications",
                    "model_tip": "Explain why alternative solutions were rejected in favor of your final choice."
                },
                {
                    "category": "HR & Company Alignment",
                    "question": f"Why are you interested in joining {req.company} and how does this role fit your career trajectory?",
                    "looking_for": "Genuine motivation, alignment with engineering culture, and long-term commitment",
                    "model_tip": "Connect company mission with your personal career growth goals."
                }
            ],
            "key_topics": ["System Design", "Cloud Infrastructure", "API Architecture", "Team Leadership"]
        }

    # Store in interview_sessions collection
    if db_manager.db is not None:
        await db_manager.db["interview_sessions"].insert_one({
            "user_id": current_user["id"],
            "resume_id": req.resume_id or "",
            "job_title": req.job_title,
            "company": req.company,
            "questions": res_json.get("questions", []),
            "key_topics": res_json.get("key_topics", []),
            "created_at": datetime.now(timezone.utc)
        })

    return APIResponse.ok(data=res_json)


@router.get("/interview-sessions", response_model=APIResponse[List[dict]])
async def list_interview_sessions(current_user: dict = Depends(get_current_user)):
    """List historical interview preparation sessions."""
    if db_manager.db is None:
        return APIResponse.ok(data=[])

    sessions = []
    async for doc in db_manager.db["interview_sessions"].find({"user_id": current_user["id"]}).sort("created_at", -1).limit(15):
        doc["id"] = str(doc.get("_id"))
        sessions.append(doc)

    return APIResponse.ok(data=sessions)


@router.post("/recommendations", response_model=APIResponse[dict])
async def get_career_recommendations(
    req: CareerRecommendationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate personalized career recommendations, skill roadmaps, and projected score gain."""
    recs = await RecommendationService.generate_recommendations(
        user_id=current_user["id"],
        resume_id=req.resume_id,
        target_role=req.target_role,
        job_description=req.job_description
    )
    return APIResponse.ok(data=recs)


@router.post("/skills", response_model=APIResponse)
async def suggest_skills(
    req: SkillSuggestRequest,
    current_user: dict = Depends(get_current_user)
):
    """Suggest top skills for a job title (Deducts 3 AI Credits)."""
    await CreditService.deduct_credits(current_user["id"], "TEXT_ENHANCEMENT", f"Skills for {req.job_title}")
    skills = await AIService.suggest_skills(current_user["id"], req)
    return APIResponse.ok(data={"skills": skills})


@router.post("/grammar-check", response_model=APIResponse)
async def correct_grammar(
    req: GrammarCheckRequest,
    current_user: dict = Depends(get_current_user)
):
    """Correct grammar and improve tone (Deducts 3 AI Credits)."""
    await CreditService.deduct_credits(current_user["id"], "TEXT_ENHANCEMENT", "Grammar check")
    corrected = await AIService.correct_grammar(current_user["id"], req)
    return APIResponse.ok(data={"corrected_text": corrected})
