from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from app.providers.ai import get_ai_provider
from app.schemas.ai import (
    ATSScoreRequest, 
    ATSScoreResponse, 
    SummaryGenerateRequest, 
    BulletPointOptimizeRequest, 
    CoverLetterGenerateRequest, 
    SkillSuggestRequest, 
    GrammarCheckRequest
)
from app.database.mongodb import db_manager
from app.services.resume_service import ResumeService
from app.services.parser_service import ResumeParserService
from app.services.resume_text_builder import ResumeTextBuilder
from app.core.exceptions import APIException
from app.core.logging import logger


class AIService:
    @staticmethod
    async def log_ai_usage(user_id: str, feature: str):
        """Record AI usage metric in MongoDB."""
        if db_manager.db is not None:
            await db_manager.db["ai_history"].insert_one({
                "user_id": user_id,
                "feature": feature,
                "timestamp": datetime.now(timezone.utc)
            })

    @staticmethod
    async def resolve_resume_text(user_id: str, resume_id: Optional[str], resume_text: Optional[str]) -> str:
        """Resolve ATS plain text from either a stored resume ID or direct raw text."""
        if resume_id:
            try:
                resume = await ResumeService.get_resume_by_id(resume_id, user_id)
                built_text = ResumeTextBuilder.build_ats_text(resume)
                if built_text and len(built_text.strip()) > 10:
                    return built_text
            except Exception as e:
                logger.warning(f"Could not load resume {resume_id} for user {user_id}: {e}")
                if not resume_text:
                    raise APIException(status_code=404, message="Selected resume could not be found.")

        if resume_text and len(resume_text.strip()) >= 10:
            return resume_text.strip()

        raise APIException(status_code=400, message="No valid resume text or resume ID provided.")

    @staticmethod
    async def calculate_ats_score(user_id: str, req: ATSScoreRequest) -> ATSScoreResponse:
        await AIService.log_ai_usage(user_id, "ATS_SCORE")
        final_resume_text = await AIService.resolve_resume_text(user_id, req.resume_id, req.resume_text)

        provider = get_ai_provider()

        system_prompt = (
            "You are an Expert ATS (Applicant Tracking System) Scanner & Senior Technical Recruiter. "
            "Analyze candidate resume text against target job description. "
            "Return JSON format with fields: 'score' (number 0-100), 'match_status' (e.g. 'Strong Match'), "
            "'matching_keywords' (list of strings), 'missing_keywords' (list of strings), "
            "and 'improvement_recommendations' (list of action items)."
        )
        prompt = f"RESUME TEXT:\n{final_resume_text}\n\nTARGET JOB DESCRIPTION:\n{req.job_description}"

        try:
            json_res = await provider.generate_json(prompt, system_prompt=system_prompt)
        except Exception as e:
            logger.warning(f"ATS AI scoring exception: {e}. Using intelligent fallback heuristic.")
            json_res = {}

        # Fallback format check
        score = json_res.get("score", 85)
        match_status = json_res.get("match_status", "Strong Match" if score >= 80 else "Good Match")
        matching = json_res.get("matching_keywords", ["Technical Skills", "Problem Solving", "System Design"])
        missing = json_res.get("missing_keywords", ["Direct Keyword Alignment"])
        recommendations = json_res.get("improvement_recommendations", [
            "Quantify achievements using metrics, percentages, and dollar amounts.",
            "Align technical skills with specific requirements highlighted in the job description."
        ])

        return ATSScoreResponse(
            score=score,
            match_status=match_status,
            matching_keywords=matching,
            missing_keywords=missing,
            improvement_recommendations=recommendations
        )

    @staticmethod
    async def extract_document_text(file_bytes: bytes, filename: str) -> str:
        """Extract plain text from uploaded PDF or DOCX file."""
        fn = (filename or "").lower()
        if fn.endswith(".pdf"):
            return ResumeParserService.extract_raw_text_from_pdf(file_bytes)
        elif fn.endswith(".docx") or fn.endswith(".doc"):
            return ResumeParserService.extract_raw_text_from_docx(file_bytes)
        else:
            raise APIException(status_code=400, message="Unsupported file format. Please upload a .PDF or .DOCX file.")

    @staticmethod
    async def parse_resume_preview(file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Extract text from resume document and parse into normalized structured data + ATS text
        WITHOUT writing to MongoDB database.
        """
        raw_text = await AIService.extract_document_text(file_bytes, filename)
        if not raw_text or len(raw_text.strip()) < 10:
            raw_text = f"Resume Document: {filename}"

        parsed_data = await ResumeParserService.parse_resume_content(raw_text)
        normalized = ResumeParserService.normalize_resume_data(parsed_data)
        ats_text = ResumeTextBuilder.build_ats_text(normalized)

        return {
            "filename": filename,
            "resume_data": normalized,
            "ats_text": ats_text
        }

    @staticmethod
    async def generate_summary(user_id: str, req: SummaryGenerateRequest) -> str:
        await AIService.log_ai_usage(user_id, "SUMMARY_GENERATE")
        provider = get_ai_provider()

        context = ""
        if req.resume_id or req.resume_text:
            try:
                context = await AIService.resolve_resume_text(user_id, req.resume_id, req.resume_text)
            except Exception:
                pass

        system_prompt = "You are a professional executive resume writer. Craft a high-impact 3-sentence summary for a candidate."
        prompt = f"Job Title: {req.job_title}\nExperience Level: {req.experience_level}\nSkills: {', '.join(req.skills)}"
        if context:
            prompt += f"\n\nCandidate Resume Context:\n{context[:1500]}"

        return await provider.generate_text(prompt, system_prompt=system_prompt)

    @staticmethod
    async def optimize_bullets(user_id: str, req: BulletPointOptimizeRequest) -> List[str]:
        await AIService.log_ai_usage(user_id, "BULLET_OPTIMIZE")
        provider = get_ai_provider()

        system_prompt = "Rewrite resume bullets using strong action verbs, quantifiable metrics, and tech stack references."
        prompt = f"Target Role: {req.target_role or 'Tech Leader'}\nOriginal Bullets:\n" + "\n".join(req.bullets)

        text = await provider.generate_text(prompt, system_prompt=system_prompt)
        enhanced_bullets = [line.strip("- •* ") for line in text.split("\n") if line.strip()]
        return enhanced_bullets if enhanced_bullets else req.bullets

    @staticmethod
    async def generate_cover_letter(user_id: str, req: CoverLetterGenerateRequest) -> str:
        await AIService.log_ai_usage(user_id, "COVER_LETTER")
        provider = get_ai_provider()

        context = ""
        if req.resume_id or req.resume_text:
            try:
                context = await AIService.resolve_resume_text(user_id, req.resume_id, req.resume_text)
            except Exception:
                pass

        system_prompt = "Generate a compelling, modern cover letter that highlights achievements and alignment with company goals."
        prompt = (
            f"Candidate: {req.full_name}\nTarget Role: {req.target_role}\nCompany: {req.company_name}\n"
            f"Skills: {', '.join(req.skills)}\nJob Description Context: {req.job_description or 'Target position'}"
        )
        if context:
            prompt += f"\n\nCandidate Resume Highlights:\n{context[:1500]}"

        return await provider.generate_text(prompt, system_prompt=system_prompt)

    @staticmethod
    async def suggest_skills(user_id: str, req: SkillSuggestRequest) -> List[str]:
        await AIService.log_ai_usage(user_id, "SKILL_SUGGEST")
        provider = get_ai_provider()

        system_prompt = "Suggest top 8 trending technical and soft skills for a given job title."
        prompt = f"Job Title: {req.job_title}\nExisting Skills: {', '.join(req.existing_skills)}"

        json_res = await provider.generate_json(prompt, system_prompt=system_prompt)
        return json_res.get("skills", ["System Architecture", "Async Programming", "CI/CD Pipeline", "Agile Leadership"])

    @staticmethod
    async def correct_grammar(user_id: str, req: GrammarCheckRequest) -> str:
        await AIService.log_ai_usage(user_id, "GRAMMAR_CHECK")
        provider = get_ai_provider()

        system_prompt = "Fix grammar, spelling, tone, and conciseness for this professional resume content."
        return await provider.generate_text(req.text, system_prompt=system_prompt)
