import traceback
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, UploadFile, File, Body, Request
from pydantic import BaseModel
from app.schemas.response import APIResponse
from app.schemas.resume import ResumeCreate, ResumeUpdate, ResumeResponse
from app.schemas.analysis import ResumeAuditResponse
from app.schemas.enhancement import EnhanceTextRequest, EnhanceTextResponse
from app.schemas.versioning import VersionDiffResponse
from app.schemas.sharing import ShareSettingsUpdate, ShareSettingsResponse
from app.services.resume_service import ResumeService
from app.services.parser_service import ResumeParserService
from app.services.analysis_service import ResumeAnalysisService
from app.services.enhancer_service import ResumeEnhancerService
from app.services.sharing_service import ResumeSharingService
from app.services.resume_version_service import ResumeVersionService
from app.services.resume_tailoring_service import ResumeTailoringService, TailorResumeRequest, TailorResumeResponse
from app.security.dependencies import get_current_user
from app.core.exceptions import APIException
from app.core.logging import logger

router = APIRouter()


class CreateVersionRequest(BaseModel):
    version_name: str
    source: Optional[str] = "MANUAL"
    company: Optional[str] = None
    job_title: Optional[str] = None
    ats_score: Optional[int] = None
    resume_data: Optional[Dict[str, Any]] = None


class RenameVersionRequest(BaseModel):
    version_name: str


class CompareVersionRequest(BaseModel):
    version_id: Optional[str] = None


@router.post("/import", response_model=APIResponse)
async def import_resume(
    request: Request,
    file: UploadFile = File(...),
    dry_run: bool = False,
    current_user: dict = Depends(get_current_user)
):
    """Import PDF/DOCX resume with detailed pipeline logging & fault-tolerant extraction."""
    logger.info(f"=== [RESUME IMPORT START] ===")
    logger.info(f"Request URL: {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    logger.info(f"File Name: {file.filename}, Content-Type: {file.content_type}")

    user_id = str(current_user.get("id") or current_user.get("_id"))
    logger.info(f"Authenticated User ID: {user_id}")

    try:
        file_name = (file.filename or "").lower()
        contents = await file.read()
        logger.info(f"Payload File Size: {len(contents)} bytes")

        if file_name.endswith(".pdf"):
            raw_text = ResumeParserService.extract_raw_text_from_pdf(contents)
        elif file_name.endswith(".docx") or file_name.endswith(".doc"):
            raw_text = ResumeParserService.extract_raw_text_from_docx(contents)
        else:
            logger.warning(f"Unsupported file format: {file_name}")
            raise APIException(status_code=400, message="Unsupported file format. Please upload a .PDF or .DOCX file.")

        if not raw_text or len(raw_text.strip()) < 10:
            logger.info("Raw text minimal/empty; using filename as raw text fallback for structured parsing.")
            raw_text = f"Candidate Resume Document: {file.filename}\nContact: candidate@exploreme.ai"

        logger.info(f"Raw Text Extracted (First 200 chars): {raw_text[:200]}")

        # Parse content using Groq AI + Regex Provider & Normalization Layer
        parsed_data = await ResumeParserService.parse_resume_content(raw_text)
        normalized_data = ResumeParserService.normalize_resume_data(parsed_data)

        logger.info(f"Parsed & Normalized Resume Title: {normalized_data.get('title')}")

        if dry_run:
            logger.info("=== [RESUME IMPORT DRY RUN SUCCESS] ===")
            return APIResponse.ok(data=normalized_data)

        create_dto = ResumeCreate(
            title=normalized_data.get("title") or f"Imported Resume – {file.filename}",
            target_role=normalized_data.get("target_role") or "Software Engineer",
            template_id="modern_linear"
        )
        new_resume = await ResumeService.create_resume(user_id, create_dto)
        logger.info(f"Created Base Resume ID: {new_resume['id']}")

        update_data = ResumeUpdate(**normalized_data)
        updated_resume = await ResumeService.update_resume(new_resume["id"], user_id, update_data)
        updated_resume["id"] = new_resume["id"]

        logger.info(f"=== [RESUME IMPORT SUCCESS] Document ID: {new_resume['id']} ===")
        return APIResponse.ok(data=updated_resume)

    except APIException as ae:
        logger.error(f"[RESUME IMPORT API EXCEPTION]: {ae.message}")
        raise ae
    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"[RESUME IMPORT ERROR TRACEBACK]:\n{tb}")
        raise APIException(status_code=500, message=f"Failed to process resume import: {str(e)}")


@router.post("/enhance-text", response_model=APIResponse[EnhanceTextResponse])
async def enhance_text(
    req: EnhanceTextRequest,
    current_user: dict = Depends(get_current_user)
):
    """Enhance bullet point or summary via AI Provider."""
    result = await ResumeEnhancerService.enhance_text(req)
    return APIResponse.ok(data=result)


@router.post("/{resume_id}/analyze", response_model=APIResponse[ResumeAuditResponse])
async def analyze_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Run 8-Point AI Resume Audit."""
    resume = await ResumeService.get_resume_by_id(resume_id, current_user["id"])
    audit_result = await ResumeAnalysisService.analyze_resume(resume)
    return APIResponse.ok(data=audit_result)


# ─── Resume Versioning Endpoints ──────────────────────────────────────────────

@router.get("/{resume_id}/versions", response_model=APIResponse[List[dict]])
async def list_resume_versions(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """List all saved snapshot / child versions for a parent resume."""
    versions = await ResumeVersionService.list_versions(current_user["id"], resume_id)
    return APIResponse.ok(data=versions)


@router.post("/{resume_id}/versions", response_model=APIResponse[dict])
async def create_resume_version(
    resume_id: str,
    req: CreateVersionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new child version / snapshot for a parent resume."""
    parent = await ResumeService.get_resume_by_id(resume_id, current_user["id"])
    resume_payload = req.resume_data or parent

    created = await ResumeVersionService.create_version(
        user_id=current_user["id"],
        parent_resume_id=resume_id,
        version_name=req.version_name,
        resume_data=resume_payload,
        source=req.source or "MANUAL",
        company=req.company,
        job_title=req.job_title,
        ats_score=req.ats_score
    )
    return APIResponse.ok(data=created)


@router.put("/{resume_id}/versions/{version_id}", response_model=APIResponse[dict])
async def rename_resume_version(
    resume_id: str,
    version_id: str,
    req: RenameVersionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Rename a child resume version."""
    renamed = await ResumeVersionService.rename_version(current_user["id"], version_id, req.version_name)
    return APIResponse.ok(data=renamed)


@router.post("/{resume_id}/versions/{version_id}/duplicate", response_model=APIResponse[dict])
async def duplicate_resume_version(
    resume_id: str,
    version_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Duplicate an existing child version."""
    duplicated = await ResumeVersionService.duplicate_version(current_user["id"], version_id)
    return APIResponse.ok(data=duplicated)


@router.post("/{resume_id}/restore/{version_id}", response_model=APIResponse)
async def restore_resume_version(
    resume_id: str,
    version_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Restore a child version snapshot into the active parent resume editor."""
    restored = await ResumeVersionService.restore_version(current_user["id"], resume_id, version_id)
    return APIResponse.ok(data=restored)


@router.delete("/{resume_id}/versions/{version_id}", response_model=APIResponse)
async def delete_resume_version(
    resume_id: str,
    version_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a child version."""
    await ResumeVersionService.delete_version(current_user["id"], version_id)
    return APIResponse.ok(data={"message": "Version deleted successfully."})


@router.post("/{resume_id}/compare", response_model=APIResponse[dict])
async def compare_resume_versions(
    resume_id: str,
    req: CompareVersionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Compare active parent resume vs a specified child version."""
    diff_result = await ResumeVersionService.compare_versions(
        current_user["id"], resume_id, req.version_id
    )
    return APIResponse.ok(data=diff_result)


@router.post("/{resume_id}/tailor-and-version", response_model=APIResponse[TailorResumeResponse])
async def tailor_resume_and_version(
    resume_id: str,
    data: TailorResumeRequest,
    current_user: dict = Depends(get_current_user)
):
    """1-Click Resume Tailoring: creates a targeted child version with optimized bullets & keywords."""
    data.resume_id = resume_id
    tailored_res = await ResumeTailoringService.tailor(current_user["id"], data)
    return APIResponse.ok(data=tailored_res)


# ─── Resume CRUD Endpoints ────────────────────────────────────────────────────

@router.get("", response_model=APIResponse[List[dict]])
async def list_resumes(current_user: dict = Depends(get_current_user)):
    """List all resumes for authenticated user."""
    resumes = await ResumeService.get_user_resumes(current_user["id"])
    return APIResponse.ok(data=resumes)


@router.post("", response_model=APIResponse)
async def create_resume(
    data: ResumeCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new blank resume."""
    resume = await ResumeService.create_resume(current_user["id"], data)
    return APIResponse.ok(data=resume)


@router.get("/{resume_id}", response_model=APIResponse)
async def get_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get single resume by ID."""
    resume = await ResumeService.get_resume_by_id(resume_id, current_user["id"])
    return APIResponse.ok(data=resume)


@router.put("/{resume_id}", response_model=APIResponse)
async def update_resume(
    resume_id: str,
    data: ResumeUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update resume content."""
    updated = await ResumeService.update_resume(resume_id, current_user["id"], data)
    return APIResponse.ok(data=updated)


@router.delete("/{resume_id}", response_model=APIResponse)
async def delete_resume(
    resume_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a resume by ID."""
    await ResumeService.delete_resume(resume_id, current_user["id"])
    return APIResponse.ok(data={"message": "Resume deleted successfully."})
