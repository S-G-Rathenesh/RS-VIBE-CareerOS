from datetime import datetime, timezone
from typing import List, Optional
from app.schemas.assistant import AssistantMessageRequest, AssistantMessageResponse, ConversationItem
from app.providers.ai.groq_provider import groq_provider
from app.services.credit_service import CreditService
from app.database.mongodb import db_manager
from app.core.exceptions import APIException


class CareerAssistantService:
    """Persistent context-aware AI Career Assistant powered by Groq LLM."""

    SYSTEM_PROMPT_TEMPLATE = """You are RS VIBE CareerOS Career Assistant — a world-class AI career coach, resume expert, portfolio strategist, and interview preparation mentor.

You have access to the user's complete career profile below. Use this data to provide hyper-personalized, actionable career guidance. Be specific, reference their actual skills, projects, and experience. Never give generic advice.

=== USER PROFILE ===
Name: {full_name}
Email: {email}
Subscription: {tier}

=== RESUME DATA ===
{resume_context}

=== PORTFOLIO DATA ===
{portfolio_context}

=== CAREER CONTEXT ===
{career_context}

=== INSTRUCTIONS ===
- Always reference the user's actual data when answering.
- Provide specific, actionable advice with examples.
- If asked to improve resume/portfolio, reference their actual content.
- If asked about skill gaps, compare their skills against industry standards.
- If asked to prepare for interviews, tailor questions to their experience level and target role.
- Be encouraging but honest about areas for improvement.
- Format responses with markdown for readability.
"""

    @classmethod
    async def _build_user_context(cls, user_id: str) -> dict:
        """Aggregate user's complete career data from MongoDB."""
        db = db_manager.db
        if db is None:
            return {"full_name": "", "email": "", "tier": "free", "resume_context": "No resume data.", "portfolio_context": "No portfolio data.", "career_context": "No career data."}

        user = await db["users"].find_one({"_id": user_id})
        full_name = user.get("full_name", "User") if user else "User"
        email = user.get("email", "") if user else ""
        tier = user.get("subscription_tier", "free") if user else "free"

        # Aggregate resume data
        resume_cursor = db["resumes"].find({"user_id": user_id}).limit(5)
        resumes = await resume_cursor.to_list(length=5)
        resume_parts = []
        for r in resumes:
            personal = r.get("personal_info", {})
            title = r.get("title", "Untitled Resume")
            target = r.get("target_role", "")
            skills = r.get("skills", [])
            education = r.get("education", [])
            experience = r.get("work_experience", [])
            projects = r.get("projects", [])

            skill_names = [s.get("name", s) if isinstance(s, dict) else str(s) for s in skills]
            edu_strs = [f"{e.get('degree', '')} at {e.get('institution', '')} ({e.get('year', '')})" for e in education if isinstance(e, dict)]
            exp_strs = [f"{e.get('title', '')} at {e.get('company', '')} ({e.get('start_date', '')} - {e.get('end_date', 'Present')})" for e in experience if isinstance(e, dict)]
            proj_strs = [f"{p.get('name', '')} — {p.get('description', '')[:100]}" for p in projects if isinstance(p, dict)]

            resume_parts.append(f"""Resume: {title}
Target Role: {target}
Skills: {', '.join(skill_names)}
Education: {'; '.join(edu_strs)}
Experience: {'; '.join(exp_strs)}
Projects: {'; '.join(proj_strs)}""")

        resume_context = "\n\n".join(resume_parts) if resume_parts else "No resume data available."

        # Aggregate portfolio data
        port_cursor = db["portfolios"].find({"user_id": user_id}).limit(5)
        portfolios = await port_cursor.to_list(length=5)
        portfolio_parts = []
        for p in portfolios:
            ptitle = p.get("title", "")
            tagline = p.get("tagline", "")
            slug = p.get("slug", "")
            published = "Published" if p.get("is_published") else "Draft"
            theme = p.get("theme_id", "")
            portfolio_parts.append(f"Portfolio: {ptitle} ({published}) — {tagline} | Theme: {theme} | URL: /p/{slug}")

        portfolio_context = "\n".join(portfolio_parts) if portfolio_parts else "No portfolio data available."

        # Career context from activity
        career_context = f"Total Resumes: {len(resumes)} | Total Portfolios: {len(portfolios)}"

        return {
            "full_name": full_name,
            "email": email,
            "tier": tier.upper(),
            "resume_context": resume_context,
            "portfolio_context": portfolio_context,
            "career_context": career_context
        }

    @classmethod
    async def _get_conversation_history(cls, user_id: str, limit: int = 10) -> List[dict]:
        """Fetch recent conversation history for multi-turn context."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["assistant_conversations"].find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
        docs = await cursor.to_list(length=limit)
        docs.reverse()  # Chronological order

        return [{"role": doc.get("role", "user"), "content": doc.get("content", "")} for doc in docs]

    @classmethod
    async def chat(cls, user_id: str, request: AssistantMessageRequest) -> AssistantMessageResponse:
        """Process a career assistant chat message."""
        # Deduct AI credits
        await CreditService.deduct_credits(user_id, "TEXT_ENHANCEMENT", f"Career Assistant: {request.message[:50]}")

        # Build personalized context
        ctx = await cls._build_user_context(user_id)
        system_prompt = cls.SYSTEM_PROMPT_TEMPLATE.format(**ctx)

        # Get conversation history
        history = await cls._get_conversation_history(user_id)

        # Build messages array for LLM
        messages = [{"role": "system", "content": system_prompt}]
        for h in history:
            messages.append(h)
        messages.append({"role": "user", "content": request.message})

        # Call Groq LLM
        ai_response = await groq_provider.generate(messages)

        # Store both user message and AI response
        db = db_manager.db
        now = datetime.now(timezone.utc).isoformat()
        conversation_id = f"conv_{user_id[:8]}_{int(datetime.now(timezone.utc).timestamp())}"

        if db is not None:
            await db["assistant_conversations"].insert_many([
                {
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "role": "user",
                    "content": request.message,
                    "context_type": request.context_type or "general",
                    "timestamp": now
                },
                {
                    "user_id": user_id,
                    "conversation_id": conversation_id,
                    "role": "assistant",
                    "content": ai_response,
                    "context_type": request.context_type or "general",
                    "timestamp": now
                }
            ])

        context_used = []
        if "resume" in request.message.lower() or request.context_type == "resume":
            context_used.append("resume_data")
        if "portfolio" in request.message.lower() or request.context_type == "portfolio":
            context_used.append("portfolio_data")
        context_used.append("user_profile")

        return AssistantMessageResponse(
            response=ai_response,
            context_used=context_used,
            credits_deducted=3,
            conversation_id=conversation_id
        )

    @classmethod
    async def get_history(cls, user_id: str, limit: int = 50) -> List[ConversationItem]:
        """Fetch full conversation history."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["assistant_conversations"].find({"user_id": user_id}).sort("timestamp", -1).limit(limit)
        docs = await cursor.to_list(length=limit)

        return [
            ConversationItem(
                id=str(doc.get("_id")),
                role=doc.get("role", "user"),
                content=doc.get("content", ""),
                context_type=doc.get("context_type", "general"),
                timestamp=doc.get("timestamp", "")
            )
            for doc in docs
        ]

    @classmethod
    async def clear_history(cls, user_id: str) -> bool:
        """Clear all conversation history for a user."""
        db = db_manager.db
        if db is not None:
            await db["assistant_conversations"].delete_many({"user_id": user_id})
        return True
