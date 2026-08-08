from typing import Optional, Dict, Any
from datetime import datetime, timezone
from app.models.brand import BrandProfile
from app.database.mongodb import db_manager
from app.providers.ai import get_ai_provider
from app.core.exceptions import NotFoundException
from app.core.logging import logger

class BrandService:
    @staticmethod
    async def get_brand_profile(user_id: str) -> BrandProfile:
        if db_manager.db is not None:
            data = await db_manager.db["brand_profiles"].find_one({"user_id": user_id})
            if data:
                return BrandProfile(**data)
        
        # Return default if not found
        return BrandProfile(user_id=user_id)

    @staticmethod
    async def save_brand_profile(user_id: str, profile_data: dict) -> BrandProfile:
        if db_manager.db is None:
            return BrandProfile(user_id=user_id, **profile_data)
            
        profile_data["updated_at"] = datetime.now(timezone.utc)
        
        await db_manager.db["brand_profiles"].update_one(
            {"user_id": user_id},
            {"$set": profile_data},
            upsert=True
        )
        
        return await BrandService.get_brand_profile(user_id)

    @staticmethod
    async def generate_brand_assets(user_id: str, prompt_context: str) -> Dict[str, str]:
        """Uses AI to generate a brand statement, headline, bios, and pitches."""
        provider = get_ai_provider()
        
        system_prompt = (
            "You are an expert Personal Branding Coach and Executive Writer. "
            "Based on the user's input, generate a complete personal brand identity. "
            "Return JSON with the following string keys: "
            "'statement' (1-2 sentences), "
            "'headline' (short professional title, e.g., 'AI Engineer & Builder'), "
            "'short_bio' (3-4 sentences), "
            "'long_bio' (2 paragraphs), "
            "'career_mission' (What drives them), "
            "'career_vision' (Where they want to go), "
            "'elevator_pitch' (30 second intro), "
            "'networking_intro' (Casual intro for networking events)."
        )
        
        prompt = f"User Background & Context:\n{prompt_context}"
        
        try:
            json_res = await provider.generate_json(prompt, system_prompt=system_prompt)
            return json_res
        except Exception as e:
            logger.warning(f"Brand Generation AI error: {e}")
            return {}
