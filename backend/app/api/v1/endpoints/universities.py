from fastapi import APIRouter, Depends, status
from typing import List
from app.schemas.response import APIResponse
from app.schemas.university import (
    CreateUniversityRequest, CreateStudentAccountRequest,
    UniversityItem, StudentItem, PlacementReportItem
)
from app.services.university_service import UniversityService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.post("", response_model=APIResponse[UniversityItem], status_code=status.HTTP_201_CREATED)
async def create_university(
    data: CreateUniversityRequest,
    current_user: dict = Depends(get_current_user)
):
    """Register a new university portal."""
    uni = await UniversityService.create_university(current_user["id"], data)
    return APIResponse.ok(data=uni)


@router.get("/{university_id}/students", response_model=APIResponse[List[StudentItem]])
async def get_students(
    university_id: str,
    current_user: dict = Depends(get_current_user)
):
    """List all students registered in the university."""
    students = await UniversityService.get_students(university_id)
    return APIResponse.ok(data=students)


@router.post("/{university_id}/students", response_model=APIResponse[StudentItem], status_code=status.HTTP_201_CREATED)
async def add_student(
    university_id: str,
    data: CreateStudentAccountRequest,
    current_user: dict = Depends(get_current_user)
):
    """Provision a student account under the university."""
    student = await UniversityService.add_student(university_id, data)
    return APIResponse.ok(data=student)


@router.get("/{university_id}/placements", response_model=APIResponse[PlacementReportItem])
async def get_placement_report(
    university_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Generate university placement analytics report."""
    report = await UniversityService.get_placement_report(university_id)
    return APIResponse.ok(data=report)
