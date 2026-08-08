from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from app.models.cms import PortfolioVersion
from app.database.mongodb import db_manager
from app.core.exceptions import NotFoundException
from app.core.logging import logger

class PortfolioCMSService:
    @staticmethod
    async def create_version(user_id: str, portfolio_id: str, version_name: str, portfolio_data: dict, status: str = "draft") -> str:
        if db_manager.db is None:
            raise NotFoundException("DB not initialized")
            
        version = PortfolioVersion(
            user_id=user_id,
            portfolio_id=portfolio_id,
            version_name=version_name,
            portfolio_data=portfolio_data,
            status=status
        )
        
        result = await db_manager.db["portfolio_versions"].insert_one(
            version.model_dump(by_alias=True, exclude={"id"})
        )
        
        return str(result.inserted_id)

    @staticmethod
    async def get_versions(user_id: str, portfolio_id: str) -> List[Dict[str, Any]]:
        if db_manager.db is None:
            return []
            
        versions = []
        cursor = db_manager.db["portfolio_versions"].find(
            {"user_id": user_id, "portfolio_id": portfolio_id}
        ).sort("created_at", -1)
        
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            versions.append(doc)
            
        return versions

    @staticmethod
    async def publish_version(user_id: str, portfolio_id: str, version_id: str) -> bool:
        if db_manager.db is None:
            return False
            
        version_data = await db_manager.db["portfolio_versions"].find_one({"_id": version_id, "user_id": user_id})
        if not version_data:
            raise NotFoundException("Version not found")
            
        # Update portfolio
        await db_manager.db["portfolios"].update_one(
            {"_id": portfolio_id, "user_id": user_id},
            {"$set": {
                **version_data["portfolio_data"],
                "is_published": True,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        # Mark all other versions as archived
        await db_manager.db["portfolio_versions"].update_many(
            {"portfolio_id": portfolio_id},
            {"$set": {"status": "archived"}}
        )
        
        # Mark this version as published
        await db_manager.db["portfolio_versions"].update_one(
            {"_id": version_id},
            {"$set": {"status": "published", "updated_at": datetime.now(timezone.utc)}}
        )
        
        return True
