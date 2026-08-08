import asyncio
import uuid
from datetime import datetime, timezone
from app.database.mongodb import db_manager, connect_to_mongo, close_mongo_connection
from app.schemas.job_application import (
    JobApplicationCreate,
    JobApplicationUpdate,
    ApplicationStatus,
    InterviewSessionCreate,
    RecruiterCreate,
    EmailGenerateRequest,
    EmailType,
    ApplyWithResumeRequest,
)
from app.services.job_application_service import JobApplicationService
from app.services.recruiter_service import RecruiterService
from app.services.interview_session_service import InterviewSessionService
from app.services.career_email_service import CareerEmailService
from app.services.career_analytics_service import CareerAnalyticsService
from app.services.career_insight_service import CareerInsightService


async def test_phase62_job_tracker():
    print("=== [PHASE 6.2 BACKEND INTEGRATION TEST SUITE] ===")
    await connect_to_mongo()
    print("MongoDB connection established.")

    test_user_id = f"usr_{uuid.uuid4().hex[:10]}"
    test_parent_resume_id = f"res_{uuid.uuid4().hex[:10]}"

    # Setup parent resume
    resumes_col = db_manager.db["resumes"]
    await resumes_col.insert_one({
        "id": test_parent_resume_id,
        "user_id": test_user_id,
        "title": "Principal Distributed Systems Master Resume",
        "target_role": "Staff Distributed Systems Architect",
        "template_id": "modern_linear",
        "personal_info": {
            "full_name": "Dr. Alex Vance",
            "email": "alex.vance@example.com",
            "location": "San Francisco, CA",
        },
        "work_experience": [
            {
                "company": "CloudScale Inc.",
                "position": "Principal Architect",
                "start_date": "2021",
                "end_date": "Present",
                "description": "Architected distributed raft clusters handling 400k QPS across 12 regions with 99.999% availability.",
            }
        ],
        "skills": ["Distributed Systems", "Kubernetes", "Rust", "Go", "Cassandra", "gRPC"],
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    })
    print(f"Created Parent Resume for Testing (ID: {test_parent_resume_id})")

    # ─────────────────────────────────────────────────────────────
    # 1. Test Recruiter Service
    # ─────────────────────────────────────────────────────────────
    print("\n--- Testing Recruiter CRM Service ---")
    recruiter_doc = await RecruiterService.create_recruiter(
        user_id=test_user_id,
        data=RecruiterCreate(
            name="Jessica Miller",
            company="Google",
            role="Staff Technical Talent Lead",
            email="jessica.m@google.com",
            linkedin="https://linkedin.com/in/jessicamiller",
            rating=5,
            conversation_notes="Very interested in Dr. Vance's multi-region distributed consensus experience.",
        ),
    )
    recruiter_id = recruiter_doc["id"]
    print(f"Created Recruiter Profile: {recruiter_doc['name']} at {recruiter_doc['company']} (ID: {recruiter_id})")

    recs_list = await RecruiterService.list_recruiters(test_user_id)
    assert len(recs_list) == 1, "Recruiter list length mismatch"
    print("Recruiter CRM Service Tests Passed!")

    # ─────────────────────────────────────────────────────────────
    # 2. Test Job Application Creation & Workspace
    # ─────────────────────────────────────────────────────────────
    print("\n--- Testing Job Application Workspace Service ---")
    app_doc = await JobApplicationService.create_application(
        user_id=test_user_id,
        data=JobApplicationCreate(
            company="Google",
            job_title="Staff Cloud Infrastructure Architect",
            job_description="Architecting ultra-scale Kubernetes clusters and distributed consensus engines.",
            status=ApplicationStatus.APPLIED,
            salary="$240k - $290k",
            location="Remote / Mountain View",
            resume_id=test_parent_resume_id,
            resume_version_name="Google SWE Version",
            recruiter_id=recruiter_id,
            recruiter_name="Jessica Miller",
            recruiter_email="jessica.m@google.com",
            tags=["Tier 1", "Cloud", "Distributed"],
        ),
    )
    app_id = app_doc["id"]
    print(f"Created Job Application: {app_doc['job_title']} at {app_doc['company']} (ID: {app_id})")

    # Update stage to INTERVIEW
    updated_app = await JobApplicationService.update_status(
        application_id=app_id,
        user_id=test_user_id,
        new_status=ApplicationStatus.INTERVIEW,
    )
    assert updated_app["status"] == "interview", "Status update failed"
    print(f"Updated Application stage to: {updated_app['status'].upper()}")

    # ─────────────────────────────────────────────────────────────
    # 3. Test Kanban Board Grouping
    # ─────────────────────────────────────────────────────────────
    print("\n--- Testing Kanban Board Grouping ---")
    kanban = await JobApplicationService.get_kanban_board(test_user_id)
    assert len(kanban["interview"]) == 1, "Expected 1 application in 'interview' column"
    print(f"Kanban Columns populated correctly: interview column has {len(kanban['interview'])} cards.")

    # ─────────────────────────────────────────────────────────────
    # 4. Test Interview Session Service
    # ─────────────────────────────────────────────────────────────
    print("\n--- Testing Interview Session Service ---")
    iv_doc = await InterviewSessionService.create_session(
        user_id=test_user_id,
        application_id=app_id,
        data=InterviewSessionCreate(
            round_name="Technical Round 1: Distributed Architecture",
            interviewer_name="Dan Zhang",
            interviewer_role="Google Fellow",
            score=94,
            user_notes="Deep dive into Paxos vs Raft, network partitions, and split-brain recovery.",
            strong_areas=["Distributed Consensus", "Failure Domain Isolation"],
            weak_areas=["Kernel eBPF metrics"],
            ai_suggestions=["Quantify throughput gains with concrete benchmark numbers."],
        ),
    )
    print(f"Logged Interview Round: '{iv_doc['round_name']}' with score {iv_doc['score']}%")

    workspace = await JobApplicationService.get_application(app_id, test_user_id)
    assert len(workspace["interviews"]) == 1, "Interview not populated in workspace"
    assert len(workspace["timeline"]) >= 2, "Timeline events missing"
    print(f"Workspace validated: {len(workspace['timeline'])} timeline entries and {len(workspace['interviews'])} interview rounds linked.")

    # ─────────────────────────────────────────────────────────────
    # 5. Test AI Email Generator
    # ─────────────────────────────────────────────────────────────
    print("\n--- Testing AI Career Email Service ---")
    thank_you_res = await CareerEmailService.generate_email(
        EmailGenerateRequest(
            application_id=app_id,
            email_type=EmailType.THANK_YOU,
            company="Google",
            job_title="Staff Cloud Infrastructure Architect",
            recipient_name="Jessica Miller",
            candidate_name="Dr. Alex Vance",
            key_points="Enjoyed our conversation on 12-region consensus and zero-downtime failover.",
        )
    )
    assert "Thank You" in thank_you_res.subject or "Google" in thank_you_res.subject
    print(f"Generated AI Email Subject: {thank_you_res.subject}")
    print("AI Career Email Service Tests Passed!")

    # ─────────────────────────────────────────────────────────────
    # 6. Test 1-Click 'Apply With Resume' Pipeline
    # ─────────────────────────────────────────────────────────────
    print("\n--- Testing 1-Click 'Apply With Resume' Automation Pipeline ---")
    pipeline_res = await JobApplicationService.apply_with_resume_pipeline(
        user_id=test_user_id,
        req=ApplyWithResumeRequest(
            parent_resume_id=test_parent_resume_id,
            company="Stripe",
            job_title="Principal Payments Infrastructure Architect",
            job_description="Design multi-currency global ledgers with ACID compliance and high-throughput real-time streaming.",
            salary="$260k - $320k",
            location="Remote / Seattle",
            auto_tailor=True,
            auto_cover_letter=True,
            auto_interview_prep=True,
        ),
    )
    print(f"Pipeline Succeeded!")
    print(f" - Created Workspace ID: {pipeline_res.application_id}")
    print(f" - Linked Child Resume Version: {pipeline_res.resume_version_name}")
    print(f" - ATS Score: {pipeline_res.ats_score}%")
    print(f" - Interview Questions Synthesized: {pipeline_res.interview_questions_count}")

    # ─────────────────────────────────────────────────────────────
    # 7. Test Career Analytics & AI Insights
    # ─────────────────────────────────────────────────────────────
    print("\n--- Testing Career Analytics & AI Insights ---")
    analytics = await CareerAnalyticsService.get_analytics(test_user_id)
    print(f"Total Applications: {analytics.total_applications}")
    print(f"Total Interviews: {analytics.total_interviews}")
    print(f"Interview Conversion Rate: {analytics.interview_conversion_rate}%")
    print(f"Average ATS Score: {analytics.average_ats_score}%")
    print(f"Top Performing Versions Count: {len(analytics.top_performing_resumes)}")

    insights = await CareerInsightService.get_insights(test_user_id)
    print(f"Weekly Summary: {insights.weekly_summary}")
    print(f"Generated {len(insights.insights)} tactical correlation insights.")

    # ─────────────────────────────────────────────────────────────
    # Cleanup Test Documents
    # ─────────────────────────────────────────────────────────────
    await db_manager.db["resumes"].delete_many({"user_id": test_user_id})
    await db_manager.db["resume_versions"].delete_many({"user_id": test_user_id})
    await db_manager.db["job_applications"].delete_many({"user_id": test_user_id})
    await db_manager.db["application_timelines"].delete_many({"user_id": test_user_id})
    await db_manager.db["application_interviews"].delete_many({"user_id": test_user_id})
    await db_manager.db["recruiters"].delete_many({"user_id": test_user_id})
    await db_manager.db["ats_analysis_history"].delete_many({"user_id": test_user_id})
    await db_manager.db["cover_letter_history"].delete_many({"user_id": test_user_id})
    print("\nCleaned up all temporary test collections in MongoDB.")

    await close_mongo_connection()
    print("\n=== ALL PHASE 6.2 TESTS COMPLETED WITH 100% SUCCESS! ===")


if __name__ == "__main__":
    asyncio.run(test_phase62_job_tracker())
