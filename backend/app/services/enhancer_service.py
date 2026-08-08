from typing import List
from app.providers.ai import get_ai_provider
from app.schemas.enhancement import EnhanceTextRequest, EnhanceTextResponse


class ResumeEnhancerService:
    TONE_INSTRUCTIONS = {
        "executive": "Rewrite in an Executive Leadership tone. Focus on high-level strategic impact, enterprise scale, revenue metrics, and organizational transformation.",
        "technical": "Rewrite in a Deep Technical tone. Highlight architectural patterns, specific frameworks, algorithmic optimization, and technical precision.",
        "recruiter": "Rewrite in a Recruiter-Friendly ATS-Optimized tone. Use strong action verbs, clear conciseness, and high-value keyword density.",
        "student": "Rewrite in an Entry-Level / Academic tone. Emphasize foundational computer science concepts, project learning, adaptability, and growth potential.",
        "professional": "Rewrite in a polished, balanced Professional Business tone emphasizing clarity, quantifiable outcomes, and active voice."
    }

    @staticmethod
    async def enhance_text(req: EnhanceTextRequest) -> EnhanceTextResponse:
        provider = get_ai_provider()

        tone_guidance = ResumeEnhancerService.TONE_INSTRUCTIONS.get(
            req.tone.lower(), 
            ResumeEnhancerService.TONE_INSTRUCTIONS["professional"]
        )

        system_prompt = (
            f"You are an Elite Career Enhancement AI & Executive Resume Coach.\n"
            f"{tone_guidance}\n"
            "Preserve all core factual accuracy and candidate details while dramatically increasing clarity, impact, and scannability.\n"
            "Return JSON format:\n"
            "{\n"
            '  "enhanced_text": "Primary improved version",\n'
            '  "alternative_variations": ["Alternative variation 1", "Alternative variation 2"]\n'
            "}"
        )

        prompt = f"TARGET ROLE: {req.target_role or 'Technology Professional'}\nSECTION TYPE: {req.section_type}\nORIGINAL TEXT:\n{req.text}"

        json_res = await provider.generate_json(prompt, system_prompt=system_prompt)

        primary_enhanced = json_res.get("enhanced_text")
        if not primary_enhanced:
            # Fallback text completion if JSON wrapper wasn't returned
            raw = await provider.generate_text(prompt, system_prompt=system_prompt)
            primary_enhanced = raw.strip()

        alternatives = json_res.get("alternative_variations", [])
        if not alternatives:
            alternatives = [
                f"{primary_enhanced} (Optimized for impact)",
                f"{primary_enhanced} (Enhanced for ATS match)"
            ]

        return EnhanceTextResponse(
            original_text=req.text,
            enhanced_text=primary_enhanced,
            tone_used=req.tone,
            alternative_variations=alternatives
        )
