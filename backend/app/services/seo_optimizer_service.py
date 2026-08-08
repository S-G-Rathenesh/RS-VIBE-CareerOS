from typing import Optional, Dict, Any
from datetime import datetime, timezone
from app.models.seo import SEOProfile
from app.database.mongodb import db_manager
from app.providers.ai import get_ai_provider
from app.core.exceptions import NotFoundException
from app.core.logging import logger

class SEOOptimizerService:
    @staticmethod
    async def generate_seo_profile(user_id: str, portfolio_id: str, portfolio_context: str) -> Dict[str, Any]:
        """Uses AI to generate an SEO Profile for a portfolio."""
        provider = get_ai_provider()
        
        system_prompt = (
            "You are an expert Technical SEO Specialist and Webmaster. "
            "Based on the user's portfolio content, generate complete SEO metadata. "
            "Return JSON with the following keys: "
            "'meta_title' (max 60 chars), "
            "'meta_description' (max 160 chars), "
            "'keywords' (List of 5-10 strings), "
            "'open_graph' (dict with og:title, og:description, og:type), "
            "'twitter_cards' (dict with twitter:title, twitter:description, twitter:card), "
            "'json_ld' (dict representing Person Schema.org markup)."
        )
        
        prompt = f"Portfolio Content:\n{portfolio_context}"
        
        try:
            json_res = await provider.generate_json(prompt, system_prompt=system_prompt)
            return json_res
        except Exception as e:
            logger.warning(f"SEO Optimizer AI error: {e}")
            return {}

    @staticmethod
    async def save_seo_profile(user_id: str, portfolio_id: str, seo_data: dict) -> SEOProfile:
        if db_manager.db is None:
            return SEOProfile(user_id=user_id, portfolio_id=portfolio_id, **seo_data)
            
        seo_data["updated_at"] = datetime.now(timezone.utc)
        
        await db_manager.db["seo_profiles"].update_one(
            {"portfolio_id": portfolio_id},
            {"$set": seo_data},
            upsert=True
        )
        
        data = await db_manager.db["seo_profiles"].find_one({"portfolio_id": portfolio_id})
        return SEOProfile(**data) if data else SEOProfile(user_id=user_id, portfolio_id=portfolio_id)

    @staticmethod
    async def get_seo_profile(portfolio_id: str) -> Optional[SEOProfile]:
        if db_manager.db is not None:
            data = await db_manager.db["seo_profiles"].find_one({"portfolio_id": portfolio_id})
            if data:
                return SEOProfile(**data)
        return None
