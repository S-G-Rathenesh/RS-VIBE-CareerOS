from pydantic import BaseModel
from typing import List, Optional


class CreateUniversityRequest(BaseModel):
    name: str
    domain: str  # e.g., "stanford.edu"
    admin_email: str


class CreateStudentAccountRequest(BaseModel):
    email: str
    full_name: str
    department: Optional[str] = ""
    batch_year: Optional[int] = None


class UniversityItem(BaseModel):
    id: str
    name: str
    domain: str
    admin_id: str
    student_count: int
    created_at: str


class StudentItem(BaseModel):
    id: str
    user_id: str
    email: str
    full_name: str
    department: str
    batch_year: Optional[int] = None
    resumes_count: int
    portfolios_count: int
    placement_status: str  # "searching", "placed", "not_started"
    joined_at: str


class PlacementReportItem(BaseModel):
    total_students: int
    placed_students: int
    searching_students: int
    placement_rate: float
    top_departments: List[dict]
    top_companies: List[str]
