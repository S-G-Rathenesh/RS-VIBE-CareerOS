from fastapi import APIRouter, Depends
from typing import List, Optional
from app.schemas.response import APIResponse
from app.services.career_roadmap_service import CareerRoadmapService, RoadmapRequest, RoadmapResponse
from app.services.skill_gap_service import SkillGapService, SkillGapRequest, SkillGapResponse
from app.services.resume_tailoring_service import ResumeTailoringService, TailorResumeRequest, TailorResumeResponse
from app.services.portfolio_generator_service import PortfolioGeneratorService, GeneratePortfolioRequest, GeneratedPortfolioResponse
from app.services.linkedin_optimizer_service import LinkedInOptimizerService, LinkedInOptimizeRequest, LinkedInOptimizeResponse
from app.services.portfolio_insights_service import PortfolioInsightsService, PortfolioInsightsRequest, PortfolioInsightsResponse
from app.services.project_generator_service import ProjectGeneratorService, ProjectGenerateRequest, GeneratedProject
from app.security.dependencies import get_current_user

router = APIRouter()


# ── Module 3: Career Roadmap ──────────────────────────────────────────────────

@router.post("/roadmap", response_model=APIResponse[RoadmapResponse])
async def generate_career_roadmap(
    data: RoadmapRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate a personalized career roadmap with timeline, courses, books, certifications, projects, and salary expectations."""
    roadmap = await CareerRoadmapService.generate_roadmap(current_user["id"], data)
    return APIResponse.ok(data=roadmap)


# ── Module 4: Skill Gap Analysis ──────────────────────────────────────────────

@router.post("/skill-gap", response_model=APIResponse[SkillGapResponse])
async def analyze_skill_gap(
    data: SkillGapRequest,
    current_user: dict = Depends(get_current_user)
):
    """Compare current skills against target job. Returns missing skills, priority, learning time, and recommended projects."""
    result = await SkillGapService.analyze(current_user["id"], data)
    return APIResponse.ok(data=result)


# ── Module 5: Resume Tailoring ────────────────────────────────────────────────

@router.post("/tailor-resume", response_model=APIResponse[TailorResumeResponse])
async def tailor_resume(
    data: TailorResumeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Compare resume against job description. Returns ATS match, missing keywords, weak sections, and one-click optimization."""
    result = await ResumeTailoringService.tailor(current_user["id"], data)
    return APIResponse.ok(data=result)


# ── Module 6: AI Portfolio Generator ──────────────────────────────────────────

@router.post("/generate-portfolio", response_model=APIResponse[GeneratedPortfolioResponse])
async def generate_portfolio(
    data: GeneratePortfolioRequest,
    current_user: dict = Depends(get_current_user)
):
    """Auto-generate a complete portfolio from resume data (Resume → Portfolio → Projects → Skills → SEO)."""
    result = await PortfolioGeneratorService.generate_from_resume(current_user["id"], data)
    return APIResponse.ok(data=result)


# ── Module 8: LinkedIn Optimizer ──────────────────────────────────────────────

@router.post("/linkedin-optimize", response_model=APIResponse[LinkedInOptimizeResponse])
async def optimize_linkedin(
    data: LinkedInOptimizeRequest,
    current_user: dict = Depends(get_current_user)
):
    """Optimize LinkedIn profile sections (Headline, About, Experience, Skills, Featured)."""
    result = await LinkedInOptimizerService.optimize(current_user["id"], data)
    return APIResponse.ok(data=result)


# ── Module 9: Portfolio Insights ──────────────────────────────────────────────

@router.post("/portfolio-insights", response_model=APIResponse[PortfolioInsightsResponse])
async def get_portfolio_insights(
    data: PortfolioInsightsRequest,
    current_user: dict = Depends(get_current_user)
):
    """AI analyzes portfolio visitor behavior and recommends improvements (popular projects, weak pages, SEO suggestions)."""
    result = await PortfolioInsightsService.analyze(current_user["id"], data)
    return APIResponse.ok(data=result)


# ── Module 10: AI Project Generator ──────────────────────────────────────────

@router.post("/generate-projects", response_model=APIResponse[List[GeneratedProject]])
async def generate_projects(
    data: ProjectGenerateRequest,
    current_user: dict = Depends(get_current_user)
):
    """Suggest portfolio projects with architecture, folder structure, tech stack, timeline, and difficulty."""
    projects = await ProjectGeneratorService.generate_projects(current_user["id"], data)
    return APIResponse.ok(data=projects)
