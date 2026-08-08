from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel
from enum import Enum
from app.database.mongodb import db_manager
from app.core.exceptions import APIException


class JobStatus(str, Enum):
    WISHLIST = "wishlist"
    APPLIED = "applied"
    INTERVIEW = "interview"
    REJECTED = "rejected"
    OFFER = "offer"


class CreateJobRequest(BaseModel):
    company: str
    role: str
    url: Optional[str] = ""
    status: JobStatus = JobStatus.WISHLIST
    deadline: Optional[str] = None
    notes: Optional[str] = ""
    recruiter_name: Optional[str] = ""
    recruiter_email: Optional[str] = ""
    salary_range: Optional[str] = ""


class UpdateJobStatusRequest(BaseModel):
    status: JobStatus
    notes: Optional[str] = None


class JobItem(BaseModel):
    id: str
    company: str
    role: str
    url: str
    status: JobStatus
    deadline: Optional[str] = None
    notes: str
    recruiter_name: str
    recruiter_email: str
    salary_range: str
    applied_at: Optional[str] = None
    created_at: str


class JobTrackerService:
    """Job Application Tracker — track applications through the hiring pipeline."""

    @classmethod
    async def create_job(cls, user_id: str, request: CreateJobRequest) -> JobItem:
        """Add a new job to the tracker."""
        db = db_manager.db
        if db is None:
            raise APIException(status_code=500, message="Database unavailable.")

        doc = {
            "user_id": user_id,
            "company": request.company,
            "role": request.role,
            "url": request.url or "",
            "status": request.status.value,
            "deadline": request.deadline,
            "notes": request.notes or "",
            "recruiter_name": request.recruiter_name or "",
            "recruiter_email": request.recruiter_email or "",
            "salary_range": request.salary_range or "",
            "applied_at": datetime.now(timezone.utc).isoformat() if request.status != JobStatus.WISHLIST else None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        res = await db["job_tracker"].insert_one(doc)

        return JobItem(id=str(res.inserted_id), **{k: v for k, v in doc.items() if k not in ["_id", "user_id"]})

    @classmethod
    async def get_jobs(cls, user_id: str, status: Optional[str] = None) -> List[JobItem]:
        """Get all tracked jobs, optionally filtered by status."""
        db = db_manager.db
        if db is None:
            return []

        query = {"user_id": user_id}
        if status:
            query["status"] = status

        cursor = db["job_tracker"].find(query).sort("created_at", -1)
        docs = await cursor.to_list(length=200)

        return [
            JobItem(
                id=str(doc.get("_id")),
                company=doc.get("company", ""),
                role=doc.get("role", ""),
                url=doc.get("url", ""),
                status=JobStatus(doc.get("status", "wishlist")),
                deadline=doc.get("deadline"),
                notes=doc.get("notes", ""),
                recruiter_name=doc.get("recruiter_name", ""),
                recruiter_email=doc.get("recruiter_email", ""),
                salary_range=doc.get("salary_range", ""),
                applied_at=doc.get("applied_at"),
                created_at=doc.get("created_at", "")
            )
            for doc in docs
        ]

    @classmethod
    async def update_status(cls, user_id: str, job_id: str, request: UpdateJobStatusRequest) -> bool:
        """Update job application status."""
        db = db_manager.db
        if db is not None:
            update_doc = {"status": request.status.value}
            if request.notes is not None:
                update_doc["notes"] = request.notes
            if request.status == JobStatus.APPLIED:
                update_doc["applied_at"] = datetime.now(timezone.utc).isoformat()
            await db["job_tracker"].update_one(
                {"_id": job_id, "user_id": user_id},
                {"$set": update_doc}
            )
        return True

    @classmethod
    async def delete_job(cls, user_id: str, job_id: str) -> bool:
        """Delete a tracked job."""
        db = db_manager.db
        if db is not None:
            await db["job_tracker"].delete_one({"_id": job_id, "user_id": user_id})
        return True
