from typing import Optional, Dict, Any
from datetime import datetime, timezone
from app.models.brand import BrandingScore
from app.database.mongodb import db_manager
from app.providers.ai import get_ai_provider
from app.core.exceptions import NotFoundException
from app.core.logging import logger

class BrandAssistantService:
    @staticmethod
    async def evaluate_brand(user_id: str, portfolio_context: str) -> BrandingScore:
        """Uses AI to evaluate a portfolio and return a branding score."""
        provider = get_ai_provider()
        
        system_prompt = (
            "You are an expert Brand Consultant and UI/UX Evaluator. "
            "Based on the user's portfolio content, evaluate their personal brand. "
            "Return JSON with the following keys: "
            "'overall_score' (0-100), "
            "'consistency_score' (0-100), "
            "'seo_score' (0-100), "
            "'accessibility_score' (0-100), "
            "'performance_score' (0-100), "
            "'suggestions' (List of dicts, each with 'type' (e.g., 'color', 'typography', 'content') and 'message')."
        )
        
        prompt = f"Portfolio Content to Evaluate:\n{portfolio_context}"
        
        try:
            json_res = await provider.generate_json(prompt, system_prompt=system_prompt)
            
            score = BrandingScore(
                user_id=user_id,
                overall_score=json_res.get("overall_score", 85),
                consistency_score=json_res.get("consistency_score", 85),
                seo_score=json_res.get("seo_score", 85),
                accessibility_score=json_res.get("accessibility_score", 85),
                performance_score=json_res.get("performance_score", 85),
                suggestions=json_res.get("suggestions", [])
            )
            
            if db_manager.db is not None:
                await db_manager.db["branding_scores"].insert_one(
                    score.model_dump(by_alias=True, exclude={"id"})
                )
                
            return score
        except Exception as e:
            logger.warning(f"Brand Assistant AI error: {e}")
            return BrandingScore(user_id=user_id)

    @staticmethod
    async def get_latest_score(user_id: str) -> Optional[BrandingScore]:
        if db_manager.db is not None:
            data = await db_manager.db["branding_scores"].find_one(
                {"user_id": user_id},
                sort=[("created_at", -1)]
            )
            if data:
                return BrandingScore(**data)
        return None
