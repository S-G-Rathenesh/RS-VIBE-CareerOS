import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.mongodb import connect_to_mongo, close_mongo_connection, db_manager
from app.services.resume_service import ResumeService
from app.schemas.resume import ResumeCreate
from app.services.resume_version_service import ResumeVersionService
from app.services.ats_history_service import ATSHistoryService
from app.services.recommendation_service import RecommendationService
from app.services.cover_letter_history_service import CoverLetterHistoryService


async def run_tests():
    print("=== [PHASE 6.1 BACKEND INTEGRATION TEST SUITE] ===")
    
    await connect_to_mongo()
    print("MongoDB connection established.")

    mock_user_id = "test_user_career_os_123"

    # Create real parent resume
    parent_create = ResumeCreate(
        title="Principal Cloud Architect Master Resume",
        target_role="Principal Cloud Architect",
        template_id="modern_linear"
    )
    parent_resume = await ResumeService.create_resume(mock_user_id, parent_create)
    mock_parent_resume_id = parent_resume["id"]
    print(f"Created Parent Resume in MongoDB: {parent_resume['title']} (ID: {mock_parent_resume_id})")

    mock_resume_data = {
        "title": "Principal Architect Master Resume",
        "target_role": "Principal Cloud Architect",
        "personal_info": {
            "full_name": "Dr. Alex Vance",
            "email": "alex@exploreme.ai",
            "summary": "Master cloud architect with 10+ years scaling global systems."
        },
        "work_experience": [
            {
                "company": "Tech Corp",
                "position": "Senior Architect",
                "description": "Architected multi-region AWS cloud infrastructure handling 5M daily requests with 99.999% SLA."
            }
        ],
        "skills": [
            {"category": "Cloud", "items": ["AWS", "Kubernetes", "Docker", "Terraform"]}
        ],
        "education": [],
        "projects": [],
        "certificates": []
    }

    # 1. Test Version Creation
    print("\n--- Testing Resume Version Service ---")
    version_1 = await ResumeVersionService.create_version(
        user_id=mock_user_id,
        parent_resume_id=mock_parent_resume_id,
        version_name="Google SWE Version",
        resume_data=mock_resume_data,
        source="AI_TAILORED",
        company="Google",
        job_title="Staff Infrastructure Engineer",
        ats_score=91
    )
    print(f"Created Version 1: {version_1.get('version_name')} (ID: {version_1.get('id')})")
    assert version_1["version_name"] == "Google SWE Version"
    assert version_1["ats_score"] == 91

    # Test listing
    versions = await ResumeVersionService.list_versions(mock_user_id, mock_parent_resume_id)
    print(f"Listed {len(versions)} child versions for parent {mock_parent_resume_id}")
    assert len(versions) >= 1

    # Test Compare
    diff_res = await ResumeVersionService.compare_versions(
        mock_user_id, mock_parent_resume_id, version_1["id"]
    )
    print(f"Diff Summary: {diff_res.get('diff_summary')}")
    print("Resume Version Service Tests Passed!")

    # 2. Test ATS History Service
    print("\n--- Testing ATS History Service ---")
    await ATSHistoryService.record_analysis(
        user_id=mock_user_id,
        resume_id=mock_parent_resume_id,
        resume_title="Master Resume",
        company="Google",
        job_title="Staff Cloud Engineer",
        job_description="Looking for GCP, Kubernetes, and Golang expertise...",
        score=91,
        match_status="Exceptional Fit",
        matching_keywords=["Kubernetes", "GCP", "Cloud"],
        missing_keywords=["Golang", "Spinnaker"],
        recommendations=["Highlight Golang distributed systems projects."]
    )
    history = await ATSHistoryService.get_history(mock_user_id)
    print(f"Recorded & fetched {len(history)} ATS history reports.")
    assert len(history) >= 1
    
    trends = await ATSHistoryService.get_score_trend(mock_user_id)
    print(f"Fetched {len(trends)} trend points: {trends}")
    print("ATS History Service Tests Passed!")

    # 3. Test Cover Letter History Service
    print("\n--- Testing Cover Letter History Service ---")
    await CoverLetterHistoryService.record_cover_letter(
        user_id=mock_user_id,
        company_name="Google",
        target_role="Staff Cloud Engineer",
        cover_letter="Dear Hiring Team at Google,\nI am writing to express my enthusiasm for...",
        resume_id=mock_parent_resume_id
    )
    letters = await CoverLetterHistoryService.list_cover_letters(mock_user_id)
    print(f"Recorded & fetched {len(letters)} tailored cover letters.")
    assert len(letters) >= 1
    print("Cover Letter History Service Tests Passed!")

    # 4. Test Career Recommendations Service
    print("\n--- Testing Career Recommendation Service ---")
    recs = await RecommendationService.generate_recommendations(
        user_id=mock_user_id,
        resume_id=mock_parent_resume_id,
        target_role="Staff Distributed Systems Architect"
    )
    print(f"Target Role: {recs.get('target_role')}")
    print(f"Score Progression: {recs.get('current_ats_score')}% -> {recs.get('estimated_ats_score')}% (+{recs.get('score_gain')}%)")
    print(f"Missing Skills: {recs.get('missing_skills')}")
    print(f"Roadmap Milestones: {len(recs.get('learning_roadmap', []))}")
    print("Career Recommendation Service Tests Passed!")

    # Clean up test artifacts
    if db_manager.db is not None:
        await db_manager.db["resumes"].delete_many({"user_id": mock_user_id})
        await db_manager.db["resume_versions"].delete_many({"user_id": mock_user_id})
        await db_manager.db["ats_analysis_history"].delete_many({"user_id": mock_user_id})
        await db_manager.db["cover_letter_history"].delete_many({"user_id": mock_user_id})
        print("Cleaned up test data in MongoDB collections.")

    await close_mongo_connection()
    print("\n=== ALL PHASE 6.1 UNIT TESTS COMPLETED WITH 100% SUCCESS! ===")


if __name__ == "__main__":
    asyncio.run(run_tests())
