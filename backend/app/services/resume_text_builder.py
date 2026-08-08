from typing import Dict, Any, List


class ResumeTextBuilder:
    """
    Unified Resume Text Builder.
    Converts structured resume data (from MongoDB, uploaded parser, or parsed JSON)
    into a standardized, ATS-friendly plain text format for AI analysis and matching.
    """

    @staticmethod
    def build_ats_text(resume: Dict[str, Any]) -> str:
        if not isinstance(resume, dict):
            return ""

        sections: List[str] = []

        # 1. Personal Information & Header
        personal = resume.get("personal_info") or {}
        if not isinstance(personal, dict):
            personal = {}

        name = personal.get("full_name") or resume.get("title") or "Candidate"
        target_role = resume.get("target_role") or ""
        email = personal.get("email") or ""
        phone = personal.get("phone") or ""
        location = personal.get("location") or ""
        website = personal.get("website") or ""
        github = personal.get("github") or ""
        linkedin = personal.get("linkedin") or ""

        header_lines = [name.upper()]
        if target_role:
            header_lines.append(target_role.upper())

        contact_items = [item for item in [email, phone, location, website, github, linkedin] if item]
        if contact_items:
            header_lines.append(" | ".join(contact_items))

        sections.append("\n".join(header_lines))

        # 2. Professional Summary
        summary = personal.get("summary") or resume.get("summary") or ""
        if summary and str(summary).strip():
            sections.append(f"PROFESSIONAL SUMMARY\n{str(summary).strip()}")

        # 3. Work Experience
        work_items = resume.get("work_experience") or resume.get("experience") or []
        if isinstance(work_items, list) and work_items:
            exp_lines = ["WORK EXPERIENCE"]
            for exp in work_items:
                if not isinstance(exp, dict):
                    continue
                pos = exp.get("position") or exp.get("title") or "Role"
                comp = exp.get("company") or exp.get("organization") or ""
                duration = exp.get("duration") or exp.get("dates") or ""
                exp_loc = exp.get("location") or ""

                title_line = f"{pos} - {comp}".strip(" - ")
                if duration:
                    title_line = f"{title_line} ({duration})"
                exp_lines.append(title_line)

                if exp_loc:
                    exp_lines.append(exp_loc)

                bullets = exp.get("bullets") or exp.get("description") or []
                if isinstance(bullets, str):
                    bullets = [bullets]
                elif isinstance(bullets, list):
                    bullets = [str(b) for b in bullets if str(b).strip()]

                for b in bullets:
                    exp_lines.append(f"- {b}")
                exp_lines.append("")  # empty line separator

            sections.append("\n".join(exp_lines).strip())

        # 4. Skills
        skills = resume.get("skills") or []
        if isinstance(skills, list) and skills:
            skill_lines = ["SKILLS"]
            for cat in skills:
                if isinstance(cat, dict):
                    cat_name = cat.get("category") or "Technical Skills"
                    items = cat.get("items") or []
                    if isinstance(items, list):
                        items_str = ", ".join([str(i) for i in items if str(i).strip()])
                        if items_str:
                            skill_lines.append(f"{cat_name}: {items_str}")
                elif isinstance(cat, str) and cat.strip():
                    skill_lines.append(f"- {cat.strip()}")

            sections.append("\n".join(skill_lines).strip())

        # 5. Projects
        projects = resume.get("projects") or []
        if isinstance(projects, list) and projects:
            proj_lines = ["PROJECTS"]
            for proj in projects:
                if not isinstance(proj, dict):
                    continue
                proj_name = proj.get("name") or proj.get("title") or "Project"
                proj_link = proj.get("link") or proj.get("url") or ""
                proj_desc = proj.get("description") or proj.get("summary") or ""
                tech = proj.get("tech_stack") or proj.get("technologies") or []

                p_header = proj_name
                if proj_link:
                    p_header = f"{proj_name} ({proj_link})"
                proj_lines.append(p_header)

                if proj_desc:
                    proj_lines.append(f"- {proj_desc}")

                if isinstance(tech, list) and tech:
                    tech_str = ", ".join([str(t) for t in tech if str(t).strip()])
                    if tech_str:
                        proj_lines.append(f"  Technologies: {tech_str}")
                proj_lines.append("")

            sections.append("\n".join(proj_lines).strip())

        # 6. Education
        education = resume.get("education") or []
        if isinstance(education, list) and education:
            edu_lines = ["EDUCATION"]
            for edu in education:
                if not isinstance(edu, dict):
                    continue
                degree = edu.get("degree") or "Degree"
                field = edu.get("field_of_study") or edu.get("major") or ""
                inst = edu.get("institution") or edu.get("university") or edu.get("school") or ""
                edu_dur = edu.get("duration") or edu.get("dates") or ""
                grade = edu.get("grade") or edu.get("gpa") or ""

                deg_str = degree
                if field and field.lower() not in degree.lower():
                    deg_str = f"{degree} in {field}"

                edu_header = f"{deg_str} - {inst}".strip(" - ")
                if edu_dur:
                    edu_header = f"{edu_header} ({edu_dur})"
                edu_lines.append(edu_header)

                if grade:
                    edu_lines.append(f"Grade / GPA: {grade}")
                edu_lines.append("")

            sections.append("\n".join(edu_lines).strip())

        # 7. Certifications
        certificates = resume.get("certificates") or resume.get("certifications") or []
        if isinstance(certificates, list) and certificates:
            cert_lines = ["CERTIFICATIONS"]
            for cert in certificates:
                if not isinstance(cert, dict):
                    continue
                cert_name = cert.get("name") or cert.get("title") or "Certification"
                issuer = cert.get("issuer") or cert.get("organization") or ""
                date = cert.get("date") or cert.get("year") or ""

                c_line = cert_name
                if issuer:
                    c_line = f"{c_line} - {issuer}"
                if date:
                    c_line = f"{c_line} ({date})"
                cert_lines.append(f"- {c_line}")

            sections.append("\n".join(cert_lines).strip())

        return "\n\n".join([s for s in sections if s.strip()])
