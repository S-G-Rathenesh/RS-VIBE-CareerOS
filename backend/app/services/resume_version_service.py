import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from app.database.mongodb import db_manager
from app.services.resume_service import ResumeService
from app.core.exceptions import APIException
from app.core.logging import logger


class ResumeVersionService:
    """
    Service managing parent-child resume versions, snapshots, restorations, and comparisons.
    """

    @staticmethod
    async def create_version(
        user_id: str,
        parent_resume_id: str,
        version_name: str,
        resume_data: Dict[str, Any],
        source: str = "MANUAL",
        company: Optional[str] = None,
        job_title: Optional[str] = None,
        ats_score: Optional[int] = None,
        job_description: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new immutable child resume version."""
        if db_manager.db is None:
            raise APIException(status_code=500, message="Database not connected.")

        # Verify parent resume ownership
        parent = await ResumeService.get_resume_by_id(parent_resume_id, user_id)
        if not parent:
            raise APIException(status_code=404, message="Parent resume not found.")

        version_id = f"ver_{uuid.uuid4().hex[:12]}"
        now = datetime.now(timezone.utc)

        doc = {
            "_id": version_id,
            "version_id": version_id,
            "parent_resume_id": parent_resume_id,
            "user_id": user_id,
            "version_name": version_name.strip() or f"Version snapshot - {now.strftime('%b %d, %H:%M')}",
            "source": source.upper(),  # "MANUAL", "AI_TAILORED", "IMPORTED", "OPTIMIZED"
            "company": company or "",
            "job_title": job_title or resume_data.get("target_role") or parent.get("target_role") or "Software Engineer",
            "ats_score": ats_score or 85,
            "job_description": job_description or "",
            "resume_data": resume_data,
            "created_at": now,
            "updated_at": now
        }

        await db_manager.db["resume_versions"].insert_one(doc)
        logger.info(f"Created resume version {version_id} ({version_name}) for parent {parent_resume_id}")
        doc["id"] = version_id
        return doc

    @staticmethod
    async def list_versions(user_id: str, parent_resume_id: str) -> List[Dict[str, Any]]:
        """List all child versions for a parent resume."""
        if db_manager.db is None:
            return []

        versions = []
        cursor = db_manager.db["resume_versions"].find(
            {"parent_resume_id": parent_resume_id, "user_id": user_id}
        ).sort("created_at", -1)

        async for doc in cursor:
            doc["id"] = str(doc.get("_id") or doc.get("version_id"))
            versions.append(doc)

        return versions

    @staticmethod
    async def get_version(user_id: str, version_id: str) -> Dict[str, Any]:
        """Fetch single version by ID."""
        if db_manager.db is None:
            raise APIException(status_code=500, message="Database not connected.")

        doc = await db_manager.db["resume_versions"].find_one({"_id": version_id, "user_id": user_id})
        if not doc:
            raise APIException(status_code=404, message="Resume version not found.")

        doc["id"] = str(doc.get("_id") or doc.get("version_id"))
        return doc

    @staticmethod
    async def rename_version(user_id: str, version_id: str, new_name: str) -> Dict[str, Any]:
        """Rename a version."""
        if db_manager.db is None:
            raise APIException(status_code=500, message="Database not connected.")

        now = datetime.now(timezone.utc)
        result = await db_manager.db["resume_versions"].find_one_and_update(
            {"_id": version_id, "user_id": user_id},
            {"$set": {"version_name": new_name.strip(), "updated_at": now}},
            return_document=True
        )
        if not result:
            raise APIException(status_code=404, message="Resume version not found.")

        result["id"] = str(result.get("_id") or result.get("version_id"))
        return result

    @staticmethod
    async def duplicate_version(user_id: str, version_id: str, new_name: Optional[str] = None) -> Dict[str, Any]:
        """Duplicate an existing child version."""
        existing = await ResumeVersionService.get_version(user_id, version_id)
        dup_name = new_name or f"Copy of {existing.get('version_name', 'Version')}"

        return await ResumeVersionService.create_version(
            user_id=user_id,
            parent_resume_id=existing["parent_resume_id"],
            version_name=dup_name,
            resume_data=existing.get("resume_data", {}),
            source=existing.get("source", "MANUAL"),
            company=existing.get("company"),
            job_title=existing.get("job_title"),
            ats_score=existing.get("ats_score"),
            job_description=existing.get("job_description")
        )

    @staticmethod
    async def restore_version(user_id: str, parent_resume_id: str, version_id: str) -> Dict[str, Any]:
        """
        Restore a version into the parent resume.
        Takes a safety snapshot of the current state before replacing.
        """
        if db_manager.db is None:
            raise APIException(status_code=500, message="Database not connected.")

        # 1. Fetch current parent resume
        parent = await ResumeService.get_resume_by_id(parent_resume_id, user_id)
        if not parent:
            raise APIException(status_code=404, message="Parent resume not found.")

        # 2. Fetch version to restore
        version_doc = await ResumeVersionService.get_version(user_id, version_id)
        restored_data = version_doc.get("resume_data") or {}

        # 3. Create safety auto-snapshot of current state
        try:
            await ResumeVersionService.create_version(
                user_id=user_id,
                parent_resume_id=parent_resume_id,
                version_name=f"Auto-backup before restoring '{version_doc.get('version_name', 'snapshot')}'",
                resume_data=parent,
                source="SNAPSHOT"
            )
        except Exception as e:
            logger.warning(f"Could not create safety snapshot: {e}")

        # 4. Overwrite parent resume with version's data
        from app.schemas.resume import ResumeUpdate
        update_dto = ResumeUpdate(
            title=parent.get("title") or "Restored Resume",
            target_role=restored_data.get("target_role") or parent.get("target_role") or "Software Engineer",
            template_id=restored_data.get("template_id") or parent.get("template_id") or "modern_linear",
            theme_config=restored_data.get("theme_config") or parent.get("theme_config"),
            personal_info=restored_data.get("personal_info") or parent.get("personal_info"),
            work_experience=restored_data.get("work_experience") or [],
            education=restored_data.get("education") or [],
            skills=restored_data.get("skills") or [],
            projects=restored_data.get("projects") or [],
            certificates=restored_data.get("certificates") or [],
            section_order=restored_data.get("section_order") or ["personal", "summary", "experience", "skills", "projects", "education", "certificates"]
        )

        updated_resume = await ResumeService.update_resume(parent_resume_id, user_id, update_dto)
        return updated_resume

    @staticmethod
    async def delete_version(user_id: str, version_id: str) -> bool:
        """Delete a version by ID."""
        if db_manager.db is None:
            return False

        result = await db_manager.db["resume_versions"].delete_one({"_id": version_id, "user_id": user_id})
        return result.deleted_count > 0

    @staticmethod
    async def compare_versions(
        user_id: str,
        parent_resume_id: str,
        version_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Compare current parent resume vs a specified child version (or compare two versions).
        Returns a structured diff highlighting added, removed, and modified sections.
        """
        parent = await ResumeService.get_resume_by_id(parent_resume_id, user_id)
        if not parent:
            raise APIException(status_code=404, message="Parent resume not found.")

        target_data = parent
        version_name = "Current Active Editor"
        if version_id:
            version_doc = await ResumeVersionService.get_version(user_id, version_id)
            target_data = version_doc.get("resume_data") or {}
            version_name = version_doc.get("version_name", "Selected Version")

        diffs = []

        # 1. Summary Comparison
        curr_summary = str(parent.get("personal_info", {}).get("summary", "")).strip()
        v_summary = str(target_data.get("personal_info", {}).get("summary", "")).strip()
        if curr_summary != v_summary:
            diffs.append({
                "change_type": "MODIFIED",
                "section": "Professional Summary",
                "content": curr_summary or "No summary in active version.",
                "previous_content": v_summary or "No summary in compared version."
            })

        # 2. Work Experience Comparison
        curr_exp = parent.get("work_experience") or []
        v_exp = target_data.get("work_experience") or []
        if len(curr_exp) != len(v_exp):
            diffs.append({
                "change_type": "MODIFIED",
                "section": "Work Experience",
                "content": f"{len(curr_exp)} positions in active editor",
                "previous_content": f"{len(v_exp)} positions in compared version"
            })

        # 3. Skills Comparison
        curr_skills_count = sum(len(c.get("items", [])) if isinstance(c, dict) else 1 for c in parent.get("skills", []))
        v_skills_count = sum(len(c.get("items", [])) if isinstance(c, dict) else 1 for c in target_data.get("skills", []))
        if curr_skills_count != v_skills_count:
            diffs.append({
                "change_type": "MODIFIED" if curr_skills_count > 0 else "REMOVED",
                "section": "Skills Inventory",
                "content": f"{curr_skills_count} total skills listed",
                "previous_content": f"{v_skills_count} skills listed in compared version"
            })

        # 4. Projects Comparison
        curr_proj = len(parent.get("projects", []))
        v_proj = len(target_data.get("projects", []))
        if curr_proj != v_proj:
            diffs.append({
                "change_type": "MODIFIED",
                "section": "Projects",
                "content": f"{curr_proj} projects listed",
                "previous_content": f"{v_proj} projects listed"
            })

        summary_msg = f"{len(diffs)} section differences detected between current editor and '{version_name}'." if diffs else "No structural differences detected."

        return {
            "current_version_id": "active_editor",
            "compared_version_id": version_id or "parent",
            "compared_version_name": version_name,
            "diff_summary": summary_msg,
            "diffs": diffs
        }
