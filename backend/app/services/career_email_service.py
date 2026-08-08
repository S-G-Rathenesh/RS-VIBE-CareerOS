from typing import Any, Dict, Optional
from app.schemas.job_application import EmailGenerateRequest, EmailGenerateResponse, EmailType
from app.providers.ai.groq_provider import groq_provider


class CareerEmailService:
    @classmethod
    async def generate_email(cls, req: EmailGenerateRequest) -> EmailGenerateResponse:
        """Generates tailored professional career emails using Groq LLM with fallback templates."""
        recipient = req.recipient_name or "Hiring Team"
        candidate = req.candidate_name or "Applicant"
        company = req.company
        role = req.job_title
        key_points = req.key_points or ""

        subject = ""
        body = ""

        # Construct prompt
        prompt = (
            f"You are an expert career advisor. Write a concise, highly professional, polite, and persuasive {req.email_type.value.replace('_', ' ').title()} email.\n"
            f"Candidate Name: {candidate}\n"
            f"Recipient: {recipient}\n"
            f"Company: {company}\n"
            f"Role: {role}\n"
            f"Additional Context/Key Points: {key_points}\n\n"
            f"Output JSON with two keys: 'subject' and 'body'."
        )

        try:
            parsed = await groq_provider.generate_json(
                prompt=prompt,
                system_prompt="You are a professional executive career communication coach. Return JSON format."
            )
            subject = parsed.get("subject", "")
            body = parsed.get("body", "")
        except Exception:
            pass
            # High quality fallback templates
            if req.email_type == EmailType.THANK_YOU:
                subject = f"Thank You - {role} Interview | {candidate}"
                body = (
                    f"Dear {recipient},\n\n"
                    f"Thank you very much for taking the time to speak with me today regarding the {role} position at {company}. "
                    f"I thoroughly enjoyed learning more about your team's current engineering initiatives and future roadmap.\n\n"
                    f"Our discussion confirmed that my background in scalable architectures, distributed systems, and modern full-stack development aligns strongly with your team's goals. {key_points}\n\n"
                    f"Please feel free to reach out if you need any additional information or work samples. I look forward to hearing about next steps.\n\n"
                    f"Best regards,\n{candidate}"
                )
            elif req.email_type == EmailType.FOLLOW_UP:
                subject = f"Following Up: {role} Application - {candidate}"
                body = (
                    f"Dear {recipient},\n\n"
                    f"I hope you are having a productive week. I am following up on my application for the {role} role at {company}.\n\n"
                    f"I remain deeply enthusiastic about the opportunity to contribute to {company}'s growth and would welcome the chance to discuss how my skill set can deliver immediate value to your team. {key_points}\n\n"
                    f"Thank you for your time and consideration, and I look forward to connecting.\n\n"
                    f"Sincerely,\n{candidate}"
                )
            elif req.email_type == EmailType.SALARY_NEGOTIATION:
                subject = f"{role} Offer - Compensation Discussion | {candidate}"
                body = (
                    f"Dear {recipient},\n\n"
                    f"Thank you for extending the offer for the {role} role at {company}. I am genuinely excited about the prospect of joining the team.\n\n"
                    f"Based on my industry experience in high-scale systems and the market research for comparable roles, I would like to discuss whether there is flexibility in the base salary and equity compensation. {key_points}\n\n"
                    f"I am eager to finalize our agreement and get started delivering impact with the team.\n\n"
                    f"Best regards,\n{candidate}"
                )
            elif req.email_type == EmailType.ACCEPTANCE:
                subject = f"Offer Acceptance - {role} | {candidate}"
                body = (
                    f"Dear {recipient},\n\n"
                    f"I am thrilled to formally accept the offer for the {role} position at {company}! Thank you for this incredible opportunity.\n\n"
                    f"I look forward to signing the formal paperwork and starting on our agreed date. Please let me know if there are any preparatory steps or documentation required beforehand.\n\n"
                    f"Warm regards,\n{candidate}"
                )
            elif req.email_type == EmailType.DECLINE:
                subject = f"{role} Opportunity Update - {candidate}"
                body = (
                    f"Dear {recipient},\n\n"
                    f"Thank you very much for offering me the {role} position at {company}. After careful consideration, I have decided to accept another offer that aligns slightly closer with my current career trajectory.\n\n"
                    f"I was truly impressed by the team and wish {company} continued success. I hope our paths cross again in the future.\n\n"
                    f"Best regards,\n{candidate}"
                )
            else:  # Referral Request
                subject = f"Inquiry regarding {role} opening at {company}"
                body = (
                    f"Hi {recipient},\n\n"
                    f"I noticed that {company} has an exciting opening for a {role}. Given your experience at {company}, I would love to learn more about the team culture and engineering priorities.\n\n"
                    f"If you are open to it, I would be deeply grateful for a referral or a quick 5-minute chat. {key_points}\n\n"
                    f"Thanks so much for your time!\n\nBest,\n{candidate}"
                )

        return EmailGenerateResponse(
            email_type=req.email_type.value,
            subject=subject,
            body=body,
        )
