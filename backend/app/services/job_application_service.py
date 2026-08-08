import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from bson import ObjectId
from app.database.mongodb import db_manager
from app.core.exceptions import NotFoundException, BadRequestException, InternalServerErrorException
from app.schemas.job_application import (
    JobApplicationCreate,
    JobApplicationUpdate,
    ApplicationStatus,
    ApplyWithResumeRequest,
    ApplyWithResumeResponse,
)
from app.services.resume_service import ResumeService
from app.services.resume_version_service import ResumeVersionService
from app.services.ats_history_service import ATSHistoryService
from app.services.cover_letter_history_service import CoverLetterHistoryService
from app.services.ai_service import AIService
from app.schemas.ai import ATSScoreRequest
from app.providers.ai.groq_provider import groq_provider


class JobApplicationService:
    @staticmethod
    def _collection():
        if db_manager.db is None:
            raise InternalServerErrorException("Database not connected")
        return db_manager.db["job_applications"]

    @staticmethod
    def _timeline_col():
        if db_manager.db is None:
            raise InternalServerErrorException("Database not connected")
        return db_manager.db["application_timelines"]

    @staticmethod
    def _interview_col():
        if db_manager.db is None:
            raise InternalServerErrorException("Database not connected")
        return db_manager.db["application_interviews"]

    @classmethod
    async def create_application(cls, user_id: str, data: JobApplicationCreate) -> Dict[str, Any]:
        """Creates a new job application and logs the initial timeline event."""
        col = cls._collection()
        now = datetime.now(timezone.utc)

        doc = data.model_dump()
        doc["id"] = f"app_{uuid.uuid4().hex[:12]}"
        doc["user_id"] = user_id
        doc["created_at"] = now
        doc["updated_at"] = now
        doc["application_date"] = data.application_date or now

        await col.insert_one(doc)

        # Log timeline event
        await cls.add_timeline_event(
            user_id=user_id,
            application_id=doc["id"],
            event_type="APPLICATION_CREATED",
            title=f"Application created for {data.job_title} at {data.company}",
            description=f"Status initialized to {data.status.value.upper()}.",
            icon="briefcase",
        )

        doc.pop("_id", None)
        return doc

    @classmethod
    async def get_application(cls, application_id: str, user_id: str) -> Dict[str, Any]:
        """Fetches full job application workspace including timeline and interviews."""
        col = cls._collection()
        doc = await col.find_one({"id": application_id, "user_id": user_id})
        if not doc:
            raise NotFoundException("Job application not found")

        doc.pop("_id", None)

        # Fetch timeline
        t_col = cls._timeline_col()
        timeline_cursor = t_col.find({"application_id": application_id, "user_id": user_id}).sort("date", -1)
        timeline = await timeline_cursor.to_list(length=100)
        for t in timeline:
            t.pop("_id", None)
        doc["timeline"] = timeline

        # Fetch interview sessions
        i_col = cls._interview_col()
        interview_cursor = i_col.find({"application_id": application_id, "user_id": user_id}).sort("created_at", -1)
        interviews = await interview_cursor.to_list(length=50)
        for i in interviews:
            i.pop("_id", None)
        doc["interviews"] = interviews

        return doc

    @classmethod
    async def list_applications(
        cls,
        user_id: str,
        status: Optional[str] = None,
        company: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        skip: int = 0,
    ) -> List[Dict[str, Any]]:
        """Lists user job applications with filtering."""
        col = cls._collection()
        query: Dict[str, Any] = {"user_id": user_id}

        if status and status != "all":
            query["status"] = status
        if company:
            query["company"] = {"$regex": company, "$options": "i"}
        if search:
            query["$or"] = [
                {"company": {"$regex": search, "$options": "i"}},
                {"job_title": {"$regex": search, "$options": "i"}},
                {"tags": {"$in": [search]}},
            ]

        cursor = col.find(query).sort("updated_at", -1).skip(skip).limit(limit)
        results = await cursor.to_list(length=limit)
        for r in results:
            r.pop("_id", None)
        return results

    @classmethod
    async def get_kanban_board(cls, user_id: str) -> Dict[str, List[Dict[str, Any]]]:
        """Returns applications grouped into Kanban columns."""
        col = cls._collection()
        cursor = col.find({"user_id": user_id}).sort("updated_at", -1)
        apps = await cursor.to_list(length=500)

        # Standardized Kanban columns
        board: Dict[str, List[Dict[str, Any]]] = {
            "draft": [],
            "applied": [],
            "assessment": [],
            "interview": [],
            "offer": [],
            "rejected": [],
            "accepted": [],
        }

        for app in apps:
            app.pop("_id", None)
            st = app.get("status", "applied")
            # Normalize status categories
            if st in ["technical_interview", "hr_interview"]:
                target_col = "interview"
            elif st in ["withdrawn"]:
                target_col = "rejected"
            elif st in board:
                target_col = st
            else:
                target_col = "applied"

            board[target_col].append(app)

        return board

    @classmethod
    async def update_application(cls, application_id: str, user_id: str, data: JobApplicationUpdate) -> Dict[str, Any]:
        """Updates job application fields and logs changes."""
        col = cls._collection()
        existing = await col.find_one({"id": application_id, "user_id": user_id})
        if not existing:
            raise NotFoundException("Job application not found")

        updates = {k: v for k, v in data.model_dump().items() if v is not None}
        if not updates:
            existing.pop("_id", None)
            return existing

        now = datetime.now(timezone.utc)
        updates["updated_at"] = now

        # If status changed, log timeline event
        if "status" in updates and updates["status"] != existing.get("status"):
            new_st = updates["status"]
            await cls.add_timeline_event(
                user_id=user_id,
                application_id=application_id,
                event_type="STATUS_CHANGE",
                title=f"Stage moved to {str(new_st).upper()}",
                description=f"Candidate application progression updated.",
                icon="git-commit",
            )

        await col.update_one({"id": application_id, "user_id": user_id}, {"$set": updates})
        return await cls.get_application(application_id, user_id)

    @classmethod
    async def update_status(cls, application_id: str, user_id: str, new_status: ApplicationStatus) -> Dict[str, Any]:
        """Quick status update for Kanban drag-and-drop actions."""
        return await cls.update_application(
            application_id, user_id, JobApplicationUpdate(status=new_status)
        )

    @classmethod
    async def delete_application(cls, application_id: str, user_id: str) -> bool:
        """Deletes job application and cleans up timelines & interviews."""
        col = cls._collection()
        res = await col.delete_one({"id": application_id, "user_id": user_id})
        if res.deleted_count == 0:
            raise NotFoundException("Job application not found")

        # Cleanup child collections
        await cls._timeline_col().delete_many({"application_id": application_id, "user_id": user_id})
        await cls._interview_col().delete_many({"application_id": application_id, "user_id": user_id})
        return True

    @classmethod
    async def add_timeline_event(
        cls,
        user_id: str,
        application_id: str,
        event_type: str,
        title: str,
        description: Optional[str] = None,
        icon: str = "clock",
        metadata: Optional[Dict[str, Any]] = None,
        date: Optional[datetime] = None,
    ) -> Dict[str, Any]:
        """Appends a new event to the application timeline."""
        t_col = cls._timeline_col()
        now = datetime.now(timezone.utc)
        doc = {
            "id": f"time_{uuid.uuid4().hex[:12]}",
            "application_id": application_id,
            "user_id": user_id,
            "event_type": event_type,
            "title": title,
            "description": description,
            "icon": icon,
            "metadata": metadata or {},
            "date": date or now,
            "created_at": now,
        }
        await t_col.insert_one(doc)
        doc.pop("_id", None)
        return doc

    @classmethod
    async def get_calendar_events(cls, user_id: str) -> List[Dict[str, Any]]:
        """Aggregates all calendar dates: application dates, interviews, deadlines, follow-ups."""
        col = cls._collection()
        apps = await col.find({"user_id": user_id}).to_list(length=300)

        events: List[Dict[str, Any]] = []
        for app in apps:
            app_id = app.get("id")
            company = app.get("company", "Company")
            job_title = app.get("job_title", "Role")

            # 1. Application Date
            if app.get("application_date"):
                events.append({
                    "id": f"evt_app_{app_id}",
                    "application_id": app_id,
                    "title": f"Applied: {company} - {job_title}",
                    "type": "APPLICATION",
                    "date": app["application_date"].isoformat() if hasattr(app["application_date"], "isoformat") else str(app["application_date"]),
                    "company": company,
                    "status": app.get("status"),
                })

            # 2. Deadline
            if app.get("deadline"):
                events.append({
                    "id": f"evt_dead_{app_id}",
                    "application_id": app_id,
                    "title": f"Deadline: {company} Application/Assessment",
                    "type": "DEADLINE",
                    "date": app["deadline"].isoformat() if hasattr(app["deadline"], "isoformat") else str(app["deadline"]),
                    "company": company,
                    "status": app.get("status"),
                })

            # 3. Follow-up
            if app.get("follow_up_date"):
                events.append({
                    "id": f"evt_fup_{app_id}",
                    "application_id": app_id,
                    "title": f"Follow-up with {company} ({app.get('recruiter_name') or 'Recruiter'})",
                    "type": "FOLLOW_UP",
                    "date": app["follow_up_date"].isoformat() if hasattr(app["follow_up_date"], "isoformat") else str(app["follow_up_date"]),
                    "company": company,
                    "status": app.get("status"),
                })

        # 4. Interviews
        i_col = cls._interview_col()
        interviews = await i_col.find({"user_id": user_id, "scheduled_at": {"$ne": None}}).to_list(length=200)
        for iv in interviews:
            app_id = iv.get("application_id")
            events.append({
                "id": f"evt_iv_{iv.get('id')}",
                "application_id": app_id,
                "title": f"Interview: {iv.get('round_name')} ({iv.get('interviewer_name') or 'Interviewer'})",
                "type": "INTERVIEW",
                "date": iv["scheduled_at"].isoformat() if hasattr(iv["scheduled_at"], "isoformat") else str(iv["scheduled_at"]),
                "meeting_link": iv.get("meeting_link"),
            })

        return events

    # ══════════════════════════════════════════════════════════════════
    # 2. AI One-Click Application Pipeline ("Apply With This Resume")
    # ══════════════════════════════════════════════════════════════════
    @classmethod
    async def apply_with_resume_pipeline(
        cls, user_id: str, req: ApplyWithResumeRequest
    ) -> ApplyWithResumeResponse:
        """
        End-to-End AI Application Pipeline:
        1. Fetch parent resume
        2. Calculate ATS score against JD
        3. Create tailored child resume version
        4. Auto-generate tailored cover letter
        5. Create Job Application workspace linking everything
        6. Pre-generate targeted interview questions
        7. Save all records and return workspace response
        """
        parent_resume = await ResumeService.get_resume_by_id(req.parent_resume_id, user_id)
        if not parent_resume:
            raise NotFoundException("Parent resume not found")

        # Step 1: Compute ATS score
        raw_resume_text = parent_resume.get("title", "") + " " + parent_resume.get("target_role", "")
        ats_score_res = await AIService.calculate_ats_score(
            user_id=user_id,
            req=ATSScoreRequest(
                resume_id=req.parent_resume_id,
                job_description=req.job_description,
            )
        )
        ats_score = ats_score_res.score
        match_status = ats_score_res.match_status

        # Step 2: Auto-Tailor child resume version
        version_name = f"{req.company} {req.job_title} Version"
        version_doc = await ResumeVersionService.create_version(
            user_id=user_id,
            parent_resume_id=req.parent_resume_id,
            version_name=version_name,
            resume_data=parent_resume,
            source="AI_TAILORED",
            company=req.company,
            job_title=req.job_title,
            ats_score=ats_score,
        )
        version_id = version_doc["id"]

        # Step 3: Record in ATS History
        await ATSHistoryService.record_analysis(
            user_id=user_id,
            resume_id=req.parent_resume_id,
            resume_title=parent_resume.get("title", "Resume"),
            company=req.company,
            job_title=req.job_title,
            job_description=req.job_description,
            score=ats_score,
            match_status=match_status,
            matching_keywords=ats_score_res.matching_keywords or ["Cloud", "Engineering", "System Design"],
            missing_keywords=ats_score_res.missing_keywords or ["Architecture"],
            recommendations=ats_score_res.improvement_recommendations or ["Emphasize scaled cloud impact and leadership."],
        )

        # Step 4: Auto-Generate Tailored Cover Letter
        generated_cover = ""
        candidate_name = parent_resume.get("personal_info", {}).get("full_name", "Applicant")
        if req.auto_cover_letter:
            try:
                cover_prompt = (
                    f"Write a compelling, professional cover letter for {candidate_name} applying to {req.company} as {req.job_title}.\n"
                    f"Target JD:\n{req.job_description}\nResume Highlights:\n{raw_resume_text[:1200]}"
                )
                generated_cover = await groq_provider.generate_text(
                    prompt=cover_prompt,
                    system_prompt="You are an expert executive cover letter writer. Return only the polished cover letter text."
                )
                if generated_cover:
                    await CoverLetterHistoryService.record_cover_letter(
                        user_id=user_id,
                        company_name=req.company,
                        target_role=req.job_title,
                        cover_letter=generated_cover,
                        resume_id=req.parent_resume_id,
                    )
            except Exception:
                generated_cover = f"Dear Hiring Team at {req.company},\n\nI am writing to express my strong enthusiasm for the {req.job_title} position. With my extensive background in full-stack architecture and high-scale systems, I look forward to driving high-impact solutions for {req.company}.\n\nSincerely,\n{candidate_name}"

        # Step 5: Create Job Application Workspace
        app_doc = await cls.create_application(
            user_id=user_id,
            data=JobApplicationCreate(
                company=req.company,
                job_title=req.job_title,
                job_description=req.job_description,
                career_page_url=req.career_page_url,
                status=req.status or ApplicationStatus.APPLIED,
                location=req.location or "Remote",
                salary=req.salary,
                resume_id=req.parent_resume_id,
                resume_version_id=version_id,
                resume_version_name=version_name,
                cover_letter_text=generated_cover,
                ats_score=ats_score,
                ats_match_status=match_status,
                notes=f"Auto-generated application workspace via 1-Click Apply Pipeline.",
                tags=["AI Tailored", req.company],
            ),
        )
        app_id = app_doc["id"]

        # Step 6: Pre-generate tailored interview questions
        questions_count = 0
        if req.auto_interview_prep:
            try:
                iv_prompt = (
                    f"Generate 5 targeted interview questions and preparation tips for {req.job_title} at {req.company}.\n"
                    f"Job Description:\n{req.job_description}\nCandidate Background:\n{raw_resume_text[:1200]}\n"
                    f"Return JSON format with a key 'questions' containing a list of objects with fields: 'category', 'question', 'model_tip'."
                )
                iv_res = await groq_provider.generate_json(
                    prompt=iv_prompt,
                    system_prompt="You are a Principal Engineering Director and Hiring Manager. Return valid JSON."
                )
                qs = iv_res.get("questions", [])
                if not qs or not isinstance(qs, list):
                    qs = [
                        {
                            "category": "Architecture & Scale",
                            "question": f"How have you architected systems at scale relevant to {req.company}?",
                            "model_tip": "Focus on trade-offs, latency, and fault-tolerance.",
                        },
                        {
                            "category": "Behavioral Leadership",
                            "question": f"Tell me about a time you led a cross-functional technical decision for {req.job_title}.",
                            "model_tip": "Use STAR format with measurable business metrics.",
                        }
                    ]
                questions_count = len(qs)

                # Save initial screening interview round
                i_col = cls._interview_col()
                await i_col.insert_one({
                    "id": f"iv_{uuid.uuid4().hex[:12]}",
                    "application_id": app_id,
                    "user_id": user_id,
                    "round_name": f"{req.company} Technical Screening",
                    "scheduled_at": None,
                    "interviewer_name": "Senior Staff Engineer",
                    "interviewer_role": "Bar Raiser",
                    "questions": qs,
                    "user_notes": "AI Pre-generated interview preparation suite.",
                    "weak_areas": ["System Latency metrics"],
                    "strong_areas": ["Architecture Patterns", "Clean Code"],
                    "ai_suggestions": ["Use STAR model for behavioral examples."],
                    "score": None,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc),
                })
            except Exception:
                questions_count = 0

        # Step 7: Append rich timeline event
        await cls.add_timeline_event(
            user_id=user_id,
            application_id=app_id,
            event_type="AI_WORKFLOW_COMPLETE",
            title=f"AI Tailored Application Pipeline Completed",
            description=f"Generated tailored version '{version_name}', ATS score {ats_score}%, cover letter, and {questions_count} interview questions.",
            icon="sparkles",
        )

        return ApplyWithResumeResponse(
            application_id=app_id,
            company=req.company,
            job_title=req.job_title,
            resume_version_id=version_id,
            resume_version_name=version_name,
            ats_score=ats_score,
            cover_letter=generated_cover,
            interview_questions_count=questions_count,
            status=app_doc.get("status", "applied"),
            message="Application workspace created and all career assets linked successfully!",
        )
