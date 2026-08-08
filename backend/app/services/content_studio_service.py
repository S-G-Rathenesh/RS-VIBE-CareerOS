from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from app.models.content import PortfolioPost
from app.database.mongodb import db_manager
from app.providers.ai import get_ai_provider
from app.core.exceptions import NotFoundException
from app.core.logging import logger

class ContentStudioService:
    @staticmethod
    async def generate_post(user_id: str, topic: str, platform: str, tone: str) -> str:
        """Uses AI to generate a post for a specific platform."""
        provider = get_ai_provider()
        
        system_prompt = (
            f"You are an expert Social Media Manager and Content Creator specializing in personal branding for Tech professionals. "
            f"Write a {platform} post about the following topic. "
            f"Tone should be: {tone}. "
        )
        
        if platform.lower() == "twitter" or platform.lower() == "x":
            system_prompt += " Keep it under 280 characters. Use 1-2 relevant hashtags."
        elif platform.lower() == "linkedin":
            system_prompt += " Structure it with a hook, a short body, and a call to action. Use line breaks. Use 3-5 relevant hashtags."
        elif platform.lower() == "blog":
            system_prompt += " Write it as a short Markdown blog post suitable for a personal portfolio website."
            
        prompt = f"Topic:\n{topic}"
        
        try:
            return await provider.generate_text(prompt, system_prompt=system_prompt)
        except Exception as e:
            logger.warning(f"Content Studio AI error: {e}")
            return "Error generating content. Please try again later."

    @staticmethod
    async def save_post(user_id: str, post_data: dict) -> PortfolioPost:
        if db_manager.db is None:
            return PortfolioPost(user_id=user_id, **post_data)
            
        post = PortfolioPost(user_id=user_id, **post_data)
        
        result = await db_manager.db["portfolio_posts"].insert_one(
            post.model_dump(by_alias=True, exclude={"id"})
        )
        post.id = str(result.inserted_id)
        
        return post

    @staticmethod
    async def get_posts(user_id: str) -> List[Dict[str, Any]]:
        if db_manager.db is None:
            return []
            
        posts = []
        cursor = db_manager.db["portfolio_posts"].find({"user_id": user_id}).sort("created_at", -1)
        
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            posts.append(doc)
            
        return posts
