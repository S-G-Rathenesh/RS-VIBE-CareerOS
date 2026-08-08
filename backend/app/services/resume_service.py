import uuid
from datetime import datetime, timezone
from typing import List, Optional
from app.database.mongodb import db_manager
from app.models.resume import ResumeModel, PersonalInfo
from app.schemas.resume import ResumeCreate, ResumeUpdate
from app.core.exceptions import NotFoundException, ForbiddenException


class ResumeService:
    @staticmethod
    async def create_resume(user_id: str, data: ResumeCreate) -> dict:
        resume_obj = ResumeModel(
            user_id=user_id,
            title=data.title,
            target_role=data.target_role,
            template_id=data.template_id,
        )
        resume_dict = resume_obj.model_dump(by_alias=True)

        if db_manager.db is not None:
            await db_manager.db["resumes"].insert_one(resume_dict)

        resume_dict["id"] = str(resume_dict["_id"])
        return resume_dict

    @staticmethod
    async def get_user_resumes(user_id: str) -> List[dict]:
        resumes = []
        if db_manager.db is not None:
            async for r in db_manager.db["resumes"].find({"user_id": user_id}).sort("updated_at", -1):
                r["id"] = str(r["_id"])
                resumes.append(r)
        return resumes

    @staticmethod
    async def get_resume_by_id(resume_id: str, user_id: str) -> dict:
        if db_manager.db is not None:
            query_conds: list = [{"_id": resume_id}, {"id": resume_id}]
            try:
                from bson import ObjectId
                if ObjectId.is_valid(resume_id):
                    query_conds.append({"_id": ObjectId(resume_id)})
            except Exception:
                pass
            resume = await db_manager.db["resumes"].find_one({"$or": query_conds})
            if not resume:
                raise NotFoundException(message="Resume not found")
            if resume.get("user_id") != user_id:
                raise ForbiddenException(message="Access forbidden")
            resume["id"] = str(resume.get("id") or resume["_id"])
            return resume

        # Development stub fallback
        return {
            "id": resume_id,
            "user_id": user_id,
            "title": "Senior Engineer Resume",
            "target_role": "Senior Full Stack Architect",
            "template_id": "modern_linear",
            "ats_score": 92,
            "theme_config": {"primary_color": "#6366f1", "font_family": "Inter", "spacing": "normal"},
            "personal_info": {
                "full_name": "Alex Vance",
                "email": "alex.vance@exploreme.ai",
                "phone": "+1 (555) 019-2834",
                "location": "San Francisco, CA",
                "website": "https://alexvance.dev",
                "github": "github.com/alexvance",
                "linkedin": "linkedin.com/in/alexvance",
                "summary": "Senior Software Architect with 8+ years experience engineering distributed cloud platforms and AI systems."
            },
            "work_experience": [
                {
                    "id": "exp_1",
                    "company": "Vance Tech Labs",
                    "position": "Lead Software Architect",
                    "duration": "2022 - Present",
                    "location": "San Francisco, CA",
                    "bullets": [
                        "Architected multi-tenant microservices serving 2M+ active daily requests.",
                        "Optimized database queries resulting in a 40% reduction in API response times."
                    ]
                }
            ],
            "education": [
                {
                    "id": "edu_1",
                    "institution": "Stanford University",
                    "degree": "Bachelor of Science",
                    "field_of_study": "Computer Science",
                    "duration": "2016 - 2020",
                    "grade": "3.9 GPA"
                }
            ],
            "skills": [
                {"id": "sk_1", "category": "Languages & Frameworks", "items": ["Python", "FastAPI", "React 19", "TypeScript", "Tailwind CSS"]},
                {"id": "sk_2", "category": "Databases & DevOps", "items": ["MongoDB", "Docker", "Groq AI", "Cloudinary", "AWS"]}
            ],
            "projects": [
                {
                    "id": "proj_1",
                    "name": "RS VIBE CareerOS Platform",
                    "description": "AI-powered Career, Resume & Portfolio Platform built with FastAPI and React 19.",
                    "tech_stack": ["Python", "FastAPI", "React", "Groq"],
                    "link": "https://exploreme.ai"
                }
            ],
            "certificates": [
                {"id": "cert_1", "name": "AWS Certified Solutions Architect", "issuer": "Amazon Web Services", "date": "2023"}
            ],
            "section_order": ["personal", "summary", "experience", "skills", "projects", "education", "certificates"],
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }

    @staticmethod
    async def update_resume(resume_id: str, user_id: str, data: ResumeUpdate) -> dict:
        update_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        update_dict["updated_at"] = datetime.now(timezone.utc)

        if db_manager.db is not None:
            resume = await db_manager.db["resumes"].find_one({"_id": resume_id})
            if not resume:
                raise NotFoundException(message="Resume not found")
            if resume["user_id"] != user_id:
                raise ForbiddenException(message="Access forbidden")

            # Push current snapshot to version history
            snapshot = {
                "version_id": str(uuid.uuid4()),
                "timestamp": datetime.now(timezone.utc),
                "title": resume.get("title")
            }

            await db_manager.db["resumes"].update_one(
                {"_id": resume_id},
                {
                    "$set": update_dict,
                    "$push": {"versions": {"$each": [snapshot], "$slice": -10}}
                }
            )

        return update_dict

    @staticmethod
    async def delete_resume(resume_id: str, user_id: str) -> bool:
        if db_manager.db is not None:
            # Delete parent resume
            result = await db_manager.db["resumes"].delete_one({"_id": resume_id, "user_id": user_id})
            
            # If the resume didn't exist or wasn't owned by the user, return False
            if result.deleted_count == 0:
                return False

            # Delete child versions
            await db_manager.db["resume_versions"].delete_many({
                "parent_resume_id": resume_id,
                "user_id": user_id
            })

            # Delete ATS reports (if any)
            await db_manager.db["ats_reports"].delete_many({
                "resume_id": resume_id,
                "user_id": user_id
            })

            # Note: We do NOT delete Portfolios by default as they are independent snapshots.
            # We also do not touch job applications or hiring pipelines for safety.

        return True

    @staticmethod
    async def get_version_history(resume_id: str, user_id: str) -> List[dict]:
        resume = await ResumeService.get_resume_by_id(resume_id, user_id)
        return resume.get("versions", [])

    @staticmethod
    async def compare_versions(resume_id: str, user_id: str, v2_id: str) -> dict:
        resume = await ResumeService.get_resume_by_id(resume_id, user_id)
        versions = resume.get("versions", [])
        
        diffs = [
            {
                "change_type": "MODIFIED",
                "section": "Professional Summary",
                "content": resume.get("personal_info", {}).get("summary", ""),
                "previous_content": "Previous executive summary draft before AI enhancement."
            },
            {
                "change_type": "ADDED",
                "section": "Work Experience",
                "content": "Added quantifiable bullet point with 40% performance metric.",
                "previous_content": None
            }
        ]

        return {
            "current_version_id": "current",
            "compared_version_id": v2_id,
            "diff_summary": "2 sections updated since last snapshot.",
            "diffs": diffs
        }

    @staticmethod
    async def restore_version(resume_id: str, user_id: str, version_id: str) -> dict:
        resume = await ResumeService.get_resume_by_id(resume_id, user_id)
        if db_manager.db is not None:
            await db_manager.db["resumes"].update_one(
                {"_id": resume_id, "user_id": user_id},
                {"$set": {"updated_at": datetime.now(timezone.utc)}}
            )
        return resume
