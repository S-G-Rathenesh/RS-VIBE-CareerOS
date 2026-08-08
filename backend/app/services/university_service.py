from datetime import datetime, timezone
from typing import List
from app.schemas.university import (
    CreateUniversityRequest, CreateStudentAccountRequest,
    UniversityItem, StudentItem, PlacementReportItem
)
from app.database.mongodb import db_manager
from app.core.exceptions import APIException


class UniversityService:
    """University Portal: Student Provisioning, Resume Review, Placement Tracking."""

    @classmethod
    async def create_university(cls, admin_id: str, request: CreateUniversityRequest) -> UniversityItem:
        """Register a university portal."""
        db = db_manager.db
        if db is None:
            raise APIException(status_code=500, message="Database unavailable.")

        uni_doc = {
            "name": request.name,
            "domain": request.domain.lower(),
            "admin_id": admin_id,
            "admin_email": request.admin_email,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        res = await db["universities"].insert_one(uni_doc)

        return UniversityItem(
            id=str(res.inserted_id),
            name=uni_doc["name"],
            domain=uni_doc["domain"],
            admin_id=admin_id,
            student_count=0,
            created_at=uni_doc["created_at"]
        )

    @classmethod
    async def add_student(cls, university_id: str, request: CreateStudentAccountRequest) -> StudentItem:
        """Provision a student account under the university."""
        db = db_manager.db
        if db is None:
            raise APIException(status_code=500, message="Database unavailable.")

        student_doc = {
            "university_id": university_id,
            "email": request.email,
            "full_name": request.full_name,
            "department": request.department or "",
            "batch_year": request.batch_year,
            "placement_status": "not_started",
            "joined_at": datetime.now(timezone.utc).isoformat()
        }
        res = await db["university_students"].insert_one(student_doc)

        return StudentItem(
            id=str(res.inserted_id),
            user_id="",
            email=student_doc["email"],
            full_name=student_doc["full_name"],
            department=student_doc["department"],
            batch_year=student_doc["batch_year"],
            resumes_count=0,
            portfolios_count=0,
            placement_status="not_started",
            joined_at=student_doc["joined_at"]
        )

    @classmethod
    async def get_students(cls, university_id: str) -> List[StudentItem]:
        """List all students in a university."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["university_students"].find({"university_id": university_id})
        docs = await cursor.to_list(length=500)

        students = []
        for doc in docs:
            students.append(StudentItem(
                id=str(doc.get("_id")),
                user_id=doc.get("user_id", ""),
                email=doc.get("email", ""),
                full_name=doc.get("full_name", ""),
                department=doc.get("department", ""),
                batch_year=doc.get("batch_year"),
                resumes_count=doc.get("resumes_count", 0),
                portfolios_count=doc.get("portfolios_count", 0),
                placement_status=doc.get("placement_status", "not_started"),
                joined_at=doc.get("joined_at", "")
            ))
        return students

    @classmethod
    async def get_placement_report(cls, university_id: str) -> PlacementReportItem:
        """Generate university placement analytics report."""
        db = db_manager.db
        if db is None:
            return PlacementReportItem(
                total_students=0, placed_students=0, searching_students=0,
                placement_rate=0.0, top_departments=[], top_companies=[]
            )

        total = await db["university_students"].count_documents({"university_id": university_id})
        placed = await db["university_students"].count_documents({"university_id": university_id, "placement_status": "placed"})
        searching = await db["university_students"].count_documents({"university_id": university_id, "placement_status": "searching"})

        rate = round((placed / total * 100), 1) if total > 0 else 0.0

        return PlacementReportItem(
            total_students=total,
            placed_students=placed,
            searching_students=searching,
            placement_rate=rate,
            top_departments=[],
            top_companies=[]
        )
