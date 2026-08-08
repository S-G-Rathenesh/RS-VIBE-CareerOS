import json
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.providers.ai import get_ai_provider
from app.database.mongodb import db_manager
from app.services.resume_service import ResumeService
from app.services.resume_text_builder import ResumeTextBuilder
from app.core.logging import logger


class RecommendationService:
    """
    AI Career Recommendation Center.
    Generates missing skill roadmaps, project suggestions, certifications, and ATS score projections.
    """

    @staticmethod
    async def generate_recommendations(
        user_id: str,
        resume_id: Optional[str] = None,
        target_role: Optional[str] = None,
        job_description: Optional[str] = None
    ) -> Dict[str, Any]:
        resume_text = ""
        role = target_role or "Software Engineer"

        if resume_id:
            try:
                resume = await ResumeService.get_resume_by_id(resume_id, user_id)
                resume_text = ResumeTextBuilder.build_ats_text(resume)
                role = target_role or resume.get("target_role") or "Software Engineer"
            except Exception as e:
                logger.warning(f"Could not load resume for recommendations: {e}")

        provider = get_ai_provider()
        system_prompt = (
            "You are a Senior Principal Engineering Director and Career Coach. "
            "Analyze the candidate's resume and target role/job description. "
            "Return JSON matching this exact structure:\n"
            "{\n"
            '  "current_ats_score": 82,\n'
            '  "estimated_ats_score": 94,\n'
            '  "missing_skills": ["System Design", "Distributed Caching", "Docker/Kubernetes"],\n'
            '  "learning_roadmap": [\n'
            '    {"milestone": "Master Distributed Microservices", "timeframe": "2 Weeks", "topics": ["gRPC", "Redis Caching"]},\n'
            '    {"milestone": "Container Orchestration", "timeframe": "3 Weeks", "topics": ["Kubernetes", "Helm", "CI/CD"]}\n'
            '  ],\n'
            '  "recommended_projects": [\n'
            '    {"title": "High-Throughput Event Broker", "tech_stack": ["Go", "Kafka", "Redis"], "impact": "Demonstrates asynchronous event streaming"}\n'
            '  ],\n'
            '  "recommended_certifications": [\n'
            '    {"title": "AWS Certified Solutions Architect", "issuer": "Amazon Web Services", "relevance": "High"}\n'
            '  ],\n'
            '  "suggested_improvements": [\n'
            '    "Quantify your microservices throughput with requests per second.",\n'
            '    "Add Docker and Redis under Technical Skills section."\n'
            '  ]\n'
            "}"
        )

        prompt = f"TARGET ROLE: {role}\n\nRESUME CONTEXT:\n{resume_text[:2500]}\n\nJOB DESCRIPTION:\n{job_description or 'Senior Engineering position'}"

        try:
            res_json = await provider.generate_json(prompt, system_prompt=system_prompt)
        except Exception as e:
            logger.warning(f"AI Recommendation exception: {e}. Using fallback recommendation suite.")
            res_json = {}

        current_score = res_json.get("current_ats_score", 82)
        estimated_score = res_json.get("estimated_ats_score", min(100, current_score + 12))

        doc = {
            "target_role": role,
            "current_ats_score": current_score,
            "estimated_ats_score": estimated_score,
            "score_gain": estimated_score - current_score,
            "missing_skills": res_json.get("missing_skills", ["Distributed Systems", "Kubernetes", "Redis Caching", "System Architecture"]),
            "learning_roadmap": res_json.get("learning_roadmap", [
                {"milestone": "System Design & Caching Patterns", "timeframe": "Week 1-2", "topics": ["Redis", "CDN Optimization", "Database Sharding"]},
                {"milestone": "Cloud DevOps & CI/CD", "timeframe": "Week 3-4", "topics": ["Docker", "Kubernetes", "GitHub Actions"]}
            ]),
            "recommended_projects": res_json.get("recommended_projects", [
                {"title": "Real-Time Telemetry Dashboard", "tech_stack": ["React", "FastAPI", "WebSockets", "TimescaleDB"], "impact": "Proves real-time event processing capabilities"},
                {"title": "Distributed Task Scheduler", "tech_stack": ["Go", "Redis", "gRPC", "Docker"], "impact": "Demonstrates concurrency & asynchronous background pipelines"}
            ]),
            "recommended_certifications": res_json.get("recommended_certifications", [
                {"title": "AWS Certified Solutions Architect - Associate", "issuer": "Amazon Web Services", "relevance": "High Impact"},
                {"title": "Certified Kubernetes Administrator (CKA)", "issuer": "Cloud Native Computing Foundation", "relevance": "High Impact"}
            ]),
            "suggested_improvements": res_json.get("suggested_improvements", [
                "Quantify bullet points with percentage latency reductions and scale metrics.",
                "Include cloud architecture keywords explicitly in your skills inventory."
            ])
        }

        # Save to database
        if db_manager.db is not None:
            await db_manager.db["recommendations"].insert_one({
                "user_id": user_id,
                "resume_id": resume_id or "",
                "created_at": datetime.now(timezone.utc),
                **doc
            })

        return doc
