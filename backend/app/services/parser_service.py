import io
import re
import uuid
from typing import Dict, Any, List
import pypdf
import docx
from app.providers.ai import get_ai_provider
from app.schemas.resume import ResumeUpdate
from app.core.exceptions import APIException
from app.core.logging import logger


class ResumeParserService:
    @staticmethod
    def extract_raw_text_from_pdf(file_bytes: bytes) -> str:
        """Extract plain text from PDF bytes using pypdf."""
        try:
            pdf_file = io.BytesIO(file_bytes)
            reader = pypdf.PdfReader(pdf_file)
            extracted_text = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted_text.append(text)
            return "\n".join(extracted_text)
        except Exception as e:
            logger.error(f"PDF extraction error: {e}")
            raise APIException(status_code=400, message="Could not extract text from PDF document.")

    @staticmethod
    def extract_raw_text_from_docx(file_bytes: bytes) -> str:
        """Extract plain text from DOCX bytes using python-docx."""
        try:
            docx_file = io.BytesIO(file_bytes)
            doc = docx.Document(docx_file)
            extracted_text = [paragraph.text for paragraph in doc.paragraphs if paragraph.text.strip()]
            return "\n".join(extracted_text)
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            raise APIException(status_code=400, message="Could not extract text from DOCX document.")

    @staticmethod
    def normalize_resume_data(data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalization layer: Converts raw/parsed LLM JSON into a guaranteed valid ResumeModel structure.
        Generates UUID 'id' for EVERY nested object (certificates, education, experience, projects, skills)
        and supplies safe default empty strings for missing required schema fields.
        """
        if not isinstance(data, dict):
            data = {}

        # 1. Personal Info
        personal_raw = data.get("personal_info") or {}
        if not isinstance(personal_raw, dict):
            personal_raw = {}

        personal_info = {
            "full_name": str(personal_raw.get("full_name") or data.get("full_name") or "Imported Candidate"),
            "email": str(personal_raw.get("email") or data.get("email") or "candidate@exploreme.ai"),
            "phone": str(personal_raw.get("phone") or data.get("phone") or ""),
            "location": str(personal_raw.get("location") or data.get("location") or ""),
            "website": str(personal_raw.get("website") or ""),
            "github": str(personal_raw.get("github") or ""),
            "linkedin": str(personal_raw.get("linkedin") or ""),
            "summary": str(personal_raw.get("summary") or data.get("summary") or "Experienced software professional.")
        }

        # 2. Work Experience
        norm_work = []
        raw_work = data.get("work_experience") or data.get("experience") or []
        if isinstance(raw_work, list):
            for item in raw_work:
                if isinstance(item, dict):
                    bullets_raw = item.get("bullets") or item.get("description") or []
                    if isinstance(bullets_raw, str):
                        bullets = [bullets_raw]
                    elif isinstance(bullets_raw, list):
                        bullets = [str(b) for b in bullets_raw if b]
                    else:
                        bullets = ["Delivered software features and key achievements."]

                    norm_work.append({
                        "id": str(item.get("id") or f"exp_{uuid.uuid4().hex[:8]}"),
                        "company": str(item.get("company") or item.get("organization") or "Company"),
                        "position": str(item.get("position") or item.get("title") or item.get("role") or "Role"),
                        "duration": str(item.get("duration") or item.get("dates") or item.get("start_date") or "Recent"),
                        "location": str(item.get("location") or ""),
                        "bullets": bullets or ["Delivered software features and key achievements."]
                    })

        # 3. Education
        norm_edu = []
        raw_edu = data.get("education") or []
        if isinstance(raw_edu, list):
            for item in raw_edu:
                if isinstance(item, dict):
                    norm_edu.append({
                        "id": str(item.get("id") or f"edu_{uuid.uuid4().hex[:8]}"),
                        "institution": str(item.get("institution") or item.get("university") or item.get("school") or "Institution"),
                        "degree": str(item.get("degree") or "Bachelor of Science"),
                        "field_of_study": str(item.get("field_of_study") or item.get("field") or item.get("major") or "Computer Science"),
                        "duration": str(item.get("duration") or item.get("dates") or item.get("year") or "Graduated"),
                        "grade": str(item.get("grade") or "")
                    })

        # 4. Skills
        norm_skills = []
        raw_skills = data.get("skills") or []
        if isinstance(raw_skills, list):
            for item in raw_skills:
                if isinstance(item, dict):
                    items_raw = item.get("items") or item.get("skills") or []
                    if isinstance(items_raw, list):
                        items_list = [str(x) for x in items_raw if x]
                    else:
                        items_list = ["Software Engineering"]

                    norm_skills.append({
                        "id": str(item.get("id") or f"sk_{uuid.uuid4().hex[:8]}"),
                        "category": str(item.get("category") or "General Skills"),
                        "items": items_list or ["Software Engineering"]
                    })
                elif isinstance(item, str) and item.strip():
                    norm_skills.append({
                        "id": f"sk_{uuid.uuid4().hex[:8]}",
                        "category": "Technical Skills",
                        "items": [item.strip()]
                    })

        if not norm_skills:
            norm_skills = [{
                "id": "sk_default",
                "category": "Technical Skills",
                "items": ["Software Engineering", "System Design", "Problem Solving"]
            }]

        # 5. Projects
        norm_projects = []
        raw_projects = data.get("projects") or []
        if isinstance(raw_projects, list):
            for item in raw_projects:
                if isinstance(item, dict):
                    stack_raw = item.get("tech_stack") or item.get("technologies") or []
                    if isinstance(stack_raw, list):
                        stack_list = [str(x) for x in stack_raw if x]
                    else:
                        stack_list = []

                    norm_projects.append({
                        "id": str(item.get("id") or f"proj_{uuid.uuid4().hex[:8]}"),
                        "name": str(item.get("name") or item.get("title") or "Portfolio Project"),
                        "description": str(item.get("description") or item.get("summary") or ""),
                        "tech_stack": stack_list,
                        "link": str(item.get("link") or item.get("url") or "")
                    })

        # 6. Certificates
        norm_certs = []
        raw_certs = data.get("certificates") or data.get("certifications") or []
        if isinstance(raw_certs, list):
            for item in raw_certs:
                if isinstance(item, dict):
                    norm_certs.append({
                        "id": str(item.get("id") or f"cert_{uuid.uuid4().hex[:8]}"),
                        "name": str(item.get("name") or item.get("title") or "Professional Certification"),
                        "issuer": str(item.get("issuer") or item.get("organization") or item.get("authority") or ""),
                        "date": str(item.get("date") or item.get("end_date") or item.get("year") or "")
                    })

        normalized = {
            "title": str(data.get("title") or f"Imported - {personal_info['full_name']}"),
            "target_role": str(data.get("target_role") or "Software Engineer"),
            "template_id": str(data.get("template_id") or "modern_linear"),
            "personal_info": personal_info,
            "work_experience": norm_work,
            "education": norm_edu,
            "skills": norm_skills,
            "projects": norm_projects,
            "certificates": norm_certs,
            "section_order": data.get("section_order") or ["personal", "summary", "experience", "skills", "projects", "education", "certificates"]
        }

        # Self-validation against ResumeUpdate schema
        try:
            ResumeUpdate(**normalized)
            logger.info(f"Resume data successfully normalized & validated against ResumeUpdate schema. ({len(norm_certs)} certs, {len(norm_work)} exp)")
        except Exception as ve:
            logger.error(f"Validation error during normalization test: {ve}")
            raise APIException(status_code=422, message=f"Normalized resume payload validation error: {str(ve)}")

        return normalized

    @staticmethod
    async def parse_resume_content(raw_text: str) -> Dict[str, Any]:
        """
        Use Groq/LLM + Regex Entity Extraction to structure raw resume text,
        then pass through normalization layer to guarantee zero Pydantic errors.
        """
        provider = get_ai_provider()

        system_prompt = (
            "You are an Expert Resume Parser AI. "
            "Extract structured candidate information from the provided raw resume text. "
            "Respond STRICTLY in valid JSON matching this structure:\n"
            "{\n"
            '  "full_name": "Candidate Full Name",\n'
            '  "email": "candidate@example.com",\n'
            '  "phone": "+1 555-0192",\n'
            '  "location": "City, State",\n'
            '  "summary": "Brief summary",\n'
            '  "target_role": "Target Position Title",\n'
            '  "work_experience": [\n'
            '     {"company": "CompName", "position": "Title", "duration": "Dates", "bullets": ["Achieved X"]}\n'
            '  ],\n'
            '  "education": [\n'
            '     {"institution": "Uni Name", "degree": "Degree", "field_of_study": "CS", "duration": "Dates"}\n'
            '  ],\n'
            '  "skills": [\n'
            '     {"category": "Languages", "items": ["Python", "JavaScript"]}\n'
            '  ],\n'
            '  "projects": [\n'
            '     {"name": "Proj Name", "description": "Desc", "tech_stack": ["React"]}\n'
            '  ],\n'
            '  "certificates": [\n'
            '     {"name": "Cert Name", "issuer": "Issuer", "date": "Year"}\n'
            '  ]\n'
            "}"
        )

        prompt = f"RAW RESUME TEXT TO PARSE:\n{raw_text[:4000]}"

        try:
            json_parsed = await provider.generate_json(prompt, system_prompt=system_prompt)
        except Exception as e:
            logger.warning(f"AI JSON generation exception: {e}. Fallback to empty parsed structure.")
            json_parsed = {}

        # Regex fallback for email
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
        if email_match and not json_parsed.get("email"):
            json_parsed["email"] = email_match.group(0)

        # Pass parsed JSON through the normalization layer
        return ResumeParserService.normalize_resume_data(json_parsed)
