import json
from datetime import datetime, timezone
from typing import List
from app.schemas.interview import (
    StartInterviewRequest, SubmitAnswerRequest,
    InterviewQuestion, AnswerEvaluation, InterviewSessionItem
)
from app.providers.ai.groq_provider import groq_provider
from app.services.credit_service import CreditService
from app.database.mongodb import db_manager
from app.core.exceptions import APIException


class InterviewCoachService:
    """AI Interview Coach: Multi-mode interview simulation with scoring."""

    MODE_PROMPTS = {
        "hr": "You are an experienced HR interviewer. Ask professional HR screening questions about culture fit, career motivation, salary expectations, and team dynamics.",
        "technical": "You are a senior technical interviewer. Ask in-depth technical questions about data structures, algorithms, system architecture, and programming concepts.",
        "behavioral": "You are a behavioral interviewer using the STAR method. Ask situational questions about leadership, conflict resolution, teamwork, and problem-solving.",
        "system_design": "You are a principal engineer conducting a system design interview. Ask about designing scalable distributed systems, databases, caching, load balancing, and microservices.",
        "coding": "You are a coding interviewer. Present algorithmic problems and evaluate code solutions for correctness, efficiency, and code quality.",
        "resume_based": "You are an interviewer reviewing the candidate's resume. Ask detailed follow-up questions about their specific projects, work experience, and technical decisions.",
    }

    @classmethod
    async def start_interview(cls, user_id: str, request: StartInterviewRequest) -> dict:
        """Generate interview questions and create a session."""
        await CreditService.deduct_credits(user_id, "INTERVIEW_SIMULATION", f"Interview: {request.mode.value} for {request.target_role}")

        mode_prompt = cls.MODE_PROMPTS.get(request.mode.value, cls.MODE_PROMPTS["technical"])

        # Build resume context for resume-based interviews
        resume_context = ""
        db = db_manager.db
        if request.mode == "resume_based" and db:
            resume = await db["resumes"].find_one({"user_id": user_id})
            if resume:
                skills = [s.get("name", s) if isinstance(s, dict) else str(s) for s in resume.get("skills", [])]
                experience = [f"{e.get('title', '')} at {e.get('company', '')}" for e in resume.get("work_experience", []) if isinstance(e, dict)]
                resume_context = f"\nCandidate Skills: {', '.join(skills)}\nCandidate Experience: {'; '.join(experience)}"

        prompt = f"""{mode_prompt}
Target Role: {request.target_role}
Target Company: {request.target_company or 'General'}
Difficulty: {request.difficulty}{resume_context}

Generate exactly 5 interview questions. Return as JSON array:
[{{"id": "q1", "question": "...", "category": "...", "difficulty": "{request.difficulty}", "tips": "..."}}]

Return ONLY the JSON array, no other text."""

        messages = [{"role": "user", "content": prompt}]
        raw_response = await groq_provider.generate(messages)

        # Parse questions
        try:
            questions_data = json.loads(raw_response.strip().strip("```json").strip("```"))
        except json.JSONDecodeError:
            questions_data = [
                {"id": "q1", "question": f"Tell me about your experience with {request.target_role}.", "category": request.mode.value, "difficulty": request.difficulty, "tips": "Be specific with examples."},
                {"id": "q2", "question": "Describe a challenging project you worked on.", "category": request.mode.value, "difficulty": request.difficulty, "tips": "Use the STAR method."},
                {"id": "q3", "question": "How do you stay current with technology trends?", "category": request.mode.value, "difficulty": request.difficulty, "tips": "Mention specific resources."},
                {"id": "q4", "question": "Where do you see yourself in 5 years?", "category": request.mode.value, "difficulty": request.difficulty, "tips": "Align with career growth."},
                {"id": "q5", "question": "Do you have any questions for us?", "category": request.mode.value, "difficulty": request.difficulty, "tips": "Always ask thoughtful questions."},
            ]

        questions = [InterviewQuestion(**q) for q in questions_data[:5]]

        # Create session in database
        session_id = f"interview_{user_id[:8]}_{int(datetime.now(timezone.utc).timestamp())}"
        if db is not None:
            session_doc = {
                "_id": session_id,
                "user_id": user_id,
                "mode": request.mode.value,
                "target_role": request.target_role,
                "target_company": request.target_company or "",
                "difficulty": request.difficulty,
                "questions": [q.model_dump() for q in questions],
                "answers": [],
                "scores": [],
                "status": "in_progress",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db["interview_sessions"].insert_one(session_doc)

        return {"session_id": session_id, "questions": questions}

    @classmethod
    async def evaluate_answer(cls, user_id: str, request: SubmitAnswerRequest) -> AnswerEvaluation:
        """Evaluate an interview answer using AI."""
        await CreditService.deduct_credits(user_id, "TEXT_ENHANCEMENT", f"Interview answer evaluation")

        db = db_manager.db
        session = await db["interview_sessions"].find_one({"_id": request.session_id, "user_id": user_id}) if db is not None else None

        question_text = "Interview question"
        if session:
            for q in session.get("questions", []):
                if q.get("id") == request.question_id:
                    question_text = q.get("question", "")
                    break

        prompt = f"""You are an expert interview evaluator. Score this interview answer.

Question: {question_text}
Candidate's Answer: {request.answer}

Evaluate and return JSON:
{{"score": 0-100, "feedback": "...", "strengths": ["..."], "improvements": ["..."], "sample_answer": "..."}}

Return ONLY the JSON object, no other text."""

        messages = [{"role": "user", "content": prompt}]
        raw_response = await groq_provider.generate(messages)

        try:
            eval_data = json.loads(raw_response.strip().strip("```json").strip("```"))
        except json.JSONDecodeError:
            eval_data = {
                "score": 70,
                "feedback": "Your answer demonstrates relevant experience. Consider adding more specific metrics and outcomes.",
                "strengths": ["Clear communication", "Relevant experience mentioned"],
                "improvements": ["Add quantifiable results", "Use STAR method more explicitly"],
                "sample_answer": "A strong answer would include specific metrics, timeline, and business impact."
            }

        evaluation = AnswerEvaluation(**eval_data)

        # Store evaluation in session
        if db is not None and session:
            await db["interview_sessions"].update_one(
                {"_id": request.session_id},
                {
                    "$push": {
                        "answers": {"question_id": request.question_id, "answer": request.answer},
                        "scores": evaluation.score
                    }
                }
            )

        return evaluation

    @classmethod
    async def get_sessions(cls, user_id: str) -> List[InterviewSessionItem]:
        """Fetch interview session history."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["interview_sessions"].find({"user_id": user_id}).sort("created_at", -1).limit(20)
        docs = await cursor.to_list(length=20)

        sessions = []
        for doc in docs:
            scores = doc.get("scores", [])
            avg = sum(scores) / len(scores) if scores else 0.0
            sessions.append(InterviewSessionItem(
                id=str(doc.get("_id")),
                mode=doc.get("mode", ""),
                target_role=doc.get("target_role", ""),
                target_company=doc.get("target_company", ""),
                questions_count=len(doc.get("questions", [])),
                average_score=round(avg, 1),
                status=doc.get("status", "completed"),
                created_at=doc.get("created_at", "")
            ))
        return sessions
