import asyncio
from app.services.parser_service import ResumeParserService
from app.schemas.resume import ResumeUpdate

def test_normalization_cases():
    print("==================================================")
    print("  TESTING RESUME IMPORT NORMALIZATION SUITE")
    print("==================================================")

    # 1. Resume with certificates only (no experience, no education, no id fields)
    print("\n1. Case 1: Resume with certificates only (missing IDs, dates, issuers)...")
    cert_only_raw = {
        "full_name": "Certificated Specialist",
        "certificates": [
            {"name": "AWS Certified Solutions Architect"}, # missing id, issuer, date
            {"name": "Google Cloud Professional", "issuer": "Google"} # missing id, date
        ]
    }
    norm_1 = ResumeParserService.normalize_resume_data(cert_only_raw)
    assert len(norm_1["certificates"]) == 2, "Should have 2 certificates"
    assert norm_1["certificates"][0]["id"].startswith("cert_"), "Generated ID must be present"
    assert norm_1["certificates"][0]["name"] == "AWS Certified Solutions Architect"
    assert norm_1["certificates"][0]["issuer"] == ""
    assert norm_1["certificates"][0]["date"] == ""
    assert norm_1["certificates"][1]["id"].startswith("cert_"), "Generated ID must be present"
    assert norm_1["certificates"][1]["issuer"] == "Google"
    
    # Validate against Pydantic ResumeUpdate model
    update_obj_1 = ResumeUpdate(**norm_1)
    assert update_obj_1.certificates[0].id is not None
    print("   [OK] Case 1 passed zero Pydantic validation errors!")

    # 2. Resume with missing dates (work experience and education missing duration/dates)
    print("\n2. Case 2: Resume with missing dates...")
    missing_dates_raw = {
        "full_name": "Undated Engineer",
        "work_experience": [
            {"company": "Tech Corp", "position": "Senior Dev"} # missing id, duration, location
        ],
        "education": [
            {"institution": "State University", "degree": "B.S. CS"} # missing id, duration, field_of_study
        ]
    }
    norm_2 = ResumeParserService.normalize_resume_data(missing_dates_raw)
    assert norm_2["work_experience"][0]["id"].startswith("exp_")
    assert norm_2["work_experience"][0]["duration"] == "Recent"
    assert norm_2["education"][0]["id"].startswith("edu_")
    assert norm_2["education"][0]["duration"] == "Graduated"

    update_obj_2 = ResumeUpdate(**norm_2)
    assert update_obj_2.work_experience[0].duration == "Recent"
    print("   [OK] Case 2 passed zero Pydantic validation errors!")

    # 3. Resume with missing issuers (certificates with missing issuers and organizations)
    print("\n3. Case 3: Resume with missing issuers...")
    missing_issuers_raw = {
        "full_name": "Certificate Holder",
        "certificates": [
            {"name": "Certified Kubernetes Administrator", "date": "2023"}
        ]
    }
    norm_3 = ResumeParserService.normalize_resume_data(missing_issuers_raw)
    assert norm_3["certificates"][0]["id"].startswith("cert_")
    assert norm_3["certificates"][0]["issuer"] == ""
    assert norm_3["certificates"][0]["date"] == "2023"

    update_obj_3 = ResumeUpdate(**norm_3)
    assert update_obj_3.certificates[0].issuer == ""
    print("   [OK] Case 3 passed zero Pydantic validation errors!")

    # 4. Resume with empty projects (projects list empty or items missing descriptions/tech_stack)
    print("\n4. Case 4: Resume with empty projects...")
    empty_projects_raw = {
        "full_name": "No Projects Dev",
        "projects": []
    }
    norm_4 = ResumeParserService.normalize_resume_data(empty_projects_raw)
    assert isinstance(norm_4["projects"], list)
    assert len(norm_4["projects"]) == 0

    update_obj_4 = ResumeUpdate(**norm_4)
    assert update_obj_4.projects == []
    print("   [OK] Case 4 passed zero Pydantic validation errors!")

    print("\n==================================================")
    print("  [OK] NORMALIZATION UNIT TEST SUITE PASSED 100%")
    print("==================================================")

if __name__ == "__main__":
    test_normalization_cases()
