import asyncio
import httpx
import json
import sys

BASE = "http://localhost:8000/api/v1"
EMAIL = "tester_qa_e2e_final@exploreme.ai"
PASSWORD = "Password123!"
NAME = "QA End-to-End Tester"

results = []

def log(step, status, detail=""):
    tag = "PASS" if status else "FAIL"
    print(f"  [{tag}] {step}" + (f" -- {detail}" if detail else ""))
    results.append({"step": step, "pass": status, "detail": detail})


async def run_qa():
    async with httpx.AsyncClient(timeout=30.0) as c:

        # 1. Register
        print("\n=== Step 1: Register / Login ===")
        r = await c.post(f"{BASE}/auth/register", json={
            "email": EMAIL, "password": PASSWORD, "full_name": NAME
        })
        if r.status_code in (200, 201):
            log("Register", True, f"status={r.status_code}")
        elif r.status_code == 409:
            log("Register", True, "user already exists (expected)")
        else:
            log("Register", False, f"status={r.status_code} body={r.text[:200]}")

        # 2. Login
        r = await c.post(f"{BASE}/auth/login", json={
            "email": EMAIL, "password": PASSWORD
        })
        token = None
        if r.status_code == 200:
            data = r.json()
            # Token is at data.tokens.access_token
            token = (data.get("data", {}).get("tokens", {}).get("access_token")
                     or data.get("data", {}).get("access_token")
                     or data.get("access_token"))
            log("Login", bool(token), f"token={'present' if token else 'MISSING'}")
        else:
            log("Login", False, f"status={r.status_code}")
            print("Cannot continue without auth token. Aborting.")
            return

        headers = {"Authorization": f"Bearer {token}"}

        # 3. List Resumes
        print("\n=== Step 2: List Resumes ===")
        r = await c.get(f"{BASE}/resumes", headers=headers)
        resumes = []
        if r.status_code == 200:
            body = r.json()
            resumes = body.get("data", []) if isinstance(body.get("data"), list) else []
            log("List Resumes", True, f"count={len(resumes)}")
        else:
            log("List Resumes", False, f"status={r.status_code}")

        # 4. Create Resume
        print("\n=== Step 3: Create Resume ===")
        r = await c.post(f"{BASE}/resumes", headers=headers, json={
            "title": "QA Integration Test Resume",
            "target_role": "Staff Software Architect",
            "template_id": "modern_linear",
            "personal_info": {
                "full_name": NAME,
                "email": EMAIL,
                "phone": "+1-555-0199",
                "location": "San Francisco, CA",
                "linkedin": "https://linkedin.com/in/qa-tester",
                "portfolio_url": "https://qa-tester.dev"
            },
            "summary": "Experienced Staff Architect with 12+ years designing distributed systems processing 500K+ TPS.",
            "work_experience": [
                {
                    "company": "TechCorp Global",
                    "position": "Staff Architect",
                    "start_date": "2020-01",
                    "end_date": "Present",
                    "description": "Led architecture for real-time payment processing handling $2B annual volume.",
                    "highlights": [
                        "Reduced P99 latency from 450ms to 12ms",
                        "Managed cross-functional team of 18 engineers"
                    ]
                },
                {
                    "company": "DataScale Inc.",
                    "position": "Senior Engineer",
                    "start_date": "2016-06",
                    "end_date": "2019-12",
                    "description": "Built ML pipeline infrastructure processing 50TB daily.",
                    "highlights": [
                        "Designed auto-scaling data pipeline reducing costs by 40%"
                    ]
                }
            ],
            "education": [{"institution": "MIT", "degree": "M.S.", "field": "Computer Science", "graduation_date": "2016", "gpa": "3.92"}],
            "skills": [
                {"category": "Languages", "items": ["Python", "Go", "Rust", "TypeScript"]},
                {"category": "Cloud", "items": ["Kubernetes", "AWS", "Terraform", "Docker"]}
            ],
            "certifications": [
                {"name": "AWS Solutions Architect Professional", "issuer": "Amazon", "date": "2023"}
            ],
            "projects": [
                {"name": "Fraud Detection Engine", "description": "ML-powered fraud detection at 100K TPS.", "tech_stack": ["Python", "TensorFlow", "Kafka"]}
            ]
        })
        resume_id = None
        if r.status_code in (200, 201):
            body = r.json()
            resume_id = body.get("data", {}).get("id")
            log("Create Resume", bool(resume_id), f"id={resume_id}")
        else:
            log("Create Resume", False, f"status={r.status_code} body={r.text[:300]}")

        # 5. Get Resume by ID
        if resume_id:
            print("\n=== Step 4: Get Resume by ID ===")
            r = await c.get(f"{BASE}/resumes/{resume_id}", headers=headers)
            if r.status_code == 200:
                body = r.json()
                has_pi = bool(body.get("data", {}).get("personal_info", {}).get("full_name"))
                log("Get Resume", True, f"has_personal_info={has_pi}")
            else:
                log("Get Resume", False, f"status={r.status_code}")

        # 6. Update Resume
        if resume_id:
            print("\n=== Step 5: Update Resume (Edit Sections) ===")
            r = await c.put(f"{BASE}/resumes/{resume_id}", headers=headers, json={
                "summary": "UPDATED: Principal Distributed Systems Architect with 15+ years expertise."
            })
            if r.status_code == 200:
                log("Update Resume", True)
            else:
                log("Update Resume", False, f"status={r.status_code}")

        # 7. ATS Score
        print("\n=== Step 6: AI ATS Score ===")
        r = await c.post(f"{BASE}/ai/ats-score", headers=headers, json={
            "resume_id": resume_id,
            "job_description": "Looking for a Staff Software Architect with expertise in distributed systems, Kubernetes, Go, and cloud-native architectures."
        })
        if r.status_code == 200:
            body = r.json()
            score = body.get("data", {}).get("score", "N/A")
            log("ATS Score", True, f"score={score}")
        else:
            log("ATS Score", False, f"status={r.status_code} body={r.text[:200]}")

        # 8. AI Summary (correct path: /ai/summary)
        print("\n=== Step 7: AI Summary Generator ===")
        r = await c.post(f"{BASE}/ai/summary", headers=headers, json={
            "resume_id": resume_id,
            "job_title": "Principal Cloud Architect",
            "tone": "executive"
        })
        if r.status_code == 200:
            log("AI Summary", True)
        else:
            log("AI Summary", False, f"status={r.status_code} body={r.text[:200]}")

        # 9. AI Cover Letter (correct path: /ai/cover-letter)
        print("\n=== Step 8: AI Cover Letter ===")
        r = await c.post(f"{BASE}/ai/cover-letter", headers=headers, json={
            "resume_id": resume_id,
            "full_name": NAME,
            "job_description": "Staff Cloud Architect at Google focusing on distributed consensus.",
            "company_name": "Google",
            "target_role": "Staff Cloud Architect"
        })
        if r.status_code == 200:
            log("AI Cover Letter", True)
        else:
            log("AI Cover Letter", False, f"status={r.status_code} body={r.text[:200]}")

        # 10. Resume Versions
        print("\n=== Step 9: Resume Versions ===")
        if resume_id:
            r = await c.get(f"{BASE}/resumes/{resume_id}/versions", headers=headers)
            if r.status_code == 200:
                body = r.json()
                versions = body.get("data", []) if isinstance(body.get("data"), list) else []
                log("List Versions", True, f"count={len(versions)}")
            else:
                log("List Versions", False, f"status={r.status_code}")

        # 11. Job Tracker CRUD (correct path: /jobs)
        print("\n=== Step 10: Job Tracker CRUD ===")
        r = await c.post(f"{BASE}/jobs", headers=headers, json={
            "company": "Google",
            "job_title": "Staff Cloud Architect",
            "job_description": "Design multi-region distributed consensus engines.",
            "status": "applied",
            "location": "Mountain View, CA",
            "salary": "$280k-$340k",
            "resume_id": resume_id,
            "tags": ["FAANG", "Cloud"]
        })
        job_id = None
        if r.status_code in (200, 201):
            body = r.json()
            job_id = body.get("data", {}).get("id")
            log("Create Job Application", bool(job_id), f"id={job_id}")
        else:
            log("Create Job Application", False, f"status={r.status_code} body={r.text[:200]}")

        # 12. Kanban Board (correct path: /jobs/kanban)
        print("\n=== Step 11: Kanban Board ===")
        r = await c.get(f"{BASE}/jobs/kanban", headers=headers)
        if r.status_code == 200:
            body = r.json()
            columns = body.get("data", {})
            total_cards = sum(len(v) for v in columns.values() if isinstance(v, list))
            log("Kanban Board", True, f"total_cards={total_cards}")
        else:
            log("Kanban Board", False, f"status={r.status_code}")

        # 13. Job Workspace
        if job_id:
            print("\n=== Step 12: Job Workspace ===")
            r = await c.get(f"{BASE}/jobs/{job_id}", headers=headers)
            if r.status_code == 200:
                body = r.json()
                ws = body.get("data", {})
                log("Job Workspace", True, f"company={ws.get('company')}, timeline_count={len(ws.get('timeline', []))}")
            else:
                log("Job Workspace", False, f"status={r.status_code}")

        # 14. Interview Session
        if job_id:
            print("\n=== Step 13: Interview Session ===")
            r = await c.post(f"{BASE}/jobs/{job_id}/interviews", headers=headers, json={
                "round_name": "System Design Final",
                "interviewer_name": "Jeff Dean",
                "interviewer_role": "SVP Engineering",
                "score": 96,
                "user_notes": "Deep dive into Paxos, Raft, and multi-region replication.",
                "strong_areas": ["Distributed Systems", "Architecture"],
                "weak_areas": [],
                "ai_suggestions": ["Quantify throughput improvements"]
            })
            if r.status_code in (200, 201):
                log("Create Interview", True)
            else:
                log("Create Interview", False, f"status={r.status_code} body={r.text[:200]}")

        # 15. Recruiter CRM (correct path: /jobs/recruiters)
        print("\n=== Step 14: Recruiter CRM ===")
        r = await c.post(f"{BASE}/jobs/recruiters", headers=headers, json={
            "name": "Sarah Chen",
            "company": "Google",
            "role": "Technical Recruiting Lead",
            "email": "sarah.chen@google.com",
            "linkedin": "https://linkedin.com/in/sarahchen",
            "rating": 5,
            "conversation_notes": "Very responsive, interested in distributed systems background."
        })
        if r.status_code in (200, 201):
            log("Create Recruiter", True)
        else:
            log("Create Recruiter", False, f"status={r.status_code} body={r.text[:200]}")

        r = await c.get(f"{BASE}/jobs/recruiters", headers=headers)
        if r.status_code == 200:
            body = r.json()
            recs = body.get("data", []) if isinstance(body.get("data"), list) else []
            log("List Recruiters", True, f"count={len(recs)}")
        else:
            log("List Recruiters", False, f"status={r.status_code}")

        # 16. AI Email Generation (correct path: /jobs/generate-email)
        print("\n=== Step 15: AI Career Email ===")
        r = await c.post(f"{BASE}/jobs/generate-email", headers=headers, json={
            "application_id": job_id or "test",
            "email_type": "thank_you",
            "company": "Google",
            "job_title": "Staff Cloud Architect",
            "recipient_name": "Sarah Chen",
            "candidate_name": NAME,
            "key_points": "Discussed distributed consensus and multi-region failover patterns."
        })
        if r.status_code == 200:
            body = r.json()
            subject = body.get("data", {}).get("subject", "N/A")
            log("AI Email Generation", True, f"subject={subject[:60]}")
        else:
            log("AI Email Generation", False, f"status={r.status_code} body={r.text[:200]}")

        # 17. Career Analytics (correct path: /jobs/analytics)
        print("\n=== Step 16: Career Analytics ===")
        r = await c.get(f"{BASE}/jobs/analytics", headers=headers)
        if r.status_code == 200:
            body = r.json()
            analytics = body.get("data", {})
            log("Career Analytics", True,
                f"total_apps={analytics.get('total_applications')}, "
                f"interviews={analytics.get('total_interviews')}, "
                f"conversion={analytics.get('interview_conversion_rate')}%")
        else:
            log("Career Analytics", False, f"status={r.status_code} body={r.text[:200]}")

        # 18. Career Insights (correct path: /jobs/insights)
        r = await c.get(f"{BASE}/jobs/insights", headers=headers)
        if r.status_code == 200:
            body = r.json()
            insights = body.get("data", {})
            log("Career Insights", True, f"insights_count={len(insights.get('insights', []))}")
        else:
            log("Career Insights", False, f"status={r.status_code} body={r.text[:200]}")

        # 19. 1-Click Apply Pipeline (correct path: /jobs/apply-workflow)
        if resume_id:
            print("\n=== Step 17: 1-Click Apply Pipeline ===")
            r = await c.post(f"{BASE}/jobs/apply-workflow", headers=headers, json={
                "parent_resume_id": resume_id,
                "company": "Stripe",
                "job_title": "Principal Payments Architect",
                "job_description": "Design global payment ledgers with ACID compliance.",
                "salary": "$300k-$380k",
                "location": "Remote / Seattle",
                "auto_tailor": True,
                "auto_cover_letter": True,
                "auto_interview_prep": True
            })
            if r.status_code == 200:
                body = r.json()
                pipe = body.get("data", {})
                log("1-Click Apply Pipeline", True,
                    f"app_id={pipe.get('application_id')}, "
                    f"ats={pipe.get('ats_score')}%, "
                    f"questions={pipe.get('interview_questions_count')}")
            else:
                log("1-Click Apply Pipeline", False, f"status={r.status_code} body={r.text[:300]}")

        # 20. Verify MongoDB persistence
        print("\n=== Step 18: MongoDB Verification ===")
        r = await c.get(f"{BASE}/resumes", headers=headers)
        if r.status_code == 200:
            body = r.json()
            total = len(body.get("data", []))
            log("MongoDB Resumes Persisted", total > 0, f"total_resumes={total}")
        else:
            log("MongoDB Resumes Persisted", False)

        r = await c.get(f"{BASE}/jobs", headers=headers)
        if r.status_code == 200:
            body = r.json()
            total = len(body.get("data", []))
            log("MongoDB Jobs Persisted", total > 0, f"total_jobs={total}")
        else:
            log("MongoDB Jobs Persisted", False)

        # 21. System Health
        print("\n=== Step 19: System Health ===")
        r = await c.get(f"{BASE}/health")
        if r.status_code == 200:
            body = r.json()
            services = body.get("data", {}).get("services", {})
            all_healthy = all(v in ("healthy", "connected", "ready") for v in services.values())
            log("System Health", all_healthy, f"services={services}")
        else:
            log("System Health", False)

        # Final Report
        passed = sum(1 for r in results if r["pass"])
        failed = sum(1 for r in results if not r["pass"])
        total = len(results)

        print("\n" + "=" * 60)
        print(f"  FINAL QA REPORT: {passed}/{total} PASSED, {failed}/{total} FAILED")
        print("=" * 60)

        if failed > 0:
            print("\n  Failed steps:")
            for r in results:
                if not r["pass"]:
                    print(f"    [FAIL] {r['step']}: {r['detail']}")

        print("\n  All steps:")
        for i, r in enumerate(results, 1):
            tag = "OK" if r["pass"] else "XX"
            print(f"    {i:2d}. [{tag}] {r['step']}")

        sys.exit(0 if failed == 0 else 1)


if __name__ == "__main__":
    asyncio.run(run_qa())
