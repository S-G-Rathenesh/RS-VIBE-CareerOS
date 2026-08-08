from datetime import datetime, timezone
from typing import Optional, Any
from bson import ObjectId
from app.database.mongodb import db_manager
from app.schemas.user import UserUpdate, PasswordChange
from app.security.password import hash_password, verify_password
from app.providers.storage import upload_image, delete_image
from app.core.exceptions import UnauthorizedException, NotFoundException
from app.core.logging import logger


def get_user_query(user_id: str) -> dict:
    conditions = [{"_id": user_id}, {"id": user_id}]
    if ObjectId.is_valid(user_id):
        conditions.append({"_id": ObjectId(user_id)})
    return {"$or": conditions}


class UserService:
    @staticmethod
    async def update_user(user_id: str, data: UserUpdate) -> dict:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        
        # Do not allow empty string to overwrite avatar_url
        if "avatar_url" in update_data and not update_data["avatar_url"]:
            del update_data["avatar_url"]
            
        update_data["updated_at"] = datetime.now(timezone.utc)

        if db_manager.db is not None:
            query = get_user_query(user_id)
            result = await db_manager.db["users"].update_one(query, {"$set": update_data})
            logger.info(
                f"[Avatar Diagnostic 2 - MongoDB Update Result] matched_count={result.matched_count}, "
                f"modified_count={result.modified_count}, update_data={update_data}"
            )
            
            user = await db_manager.db["users"].find_one(query)
            if user:
                user["id"] = str(user.get("_id") or user.get("id"))
                return user

        return {"id": user_id, "full_name": data.full_name or "Updated Name"}

    @staticmethod
    async def remove_avatar(user_id: str) -> dict:
        """Delete user avatar from Cloudinary and clear metadata in MongoDB."""
        if db_manager.db is not None:
            query = get_user_query(user_id)
            user = await db_manager.db["users"].find_one(query)
            if user and user.get("avatar_public_id"):
                logger.info(f"[Avatar Diagnostic - Deleting Cloudinary Asset] avatar_public_id={user['avatar_public_id']}")
                await delete_image(user["avatar_public_id"])

            result = await db_manager.db["users"].update_one(
                query,
                {
                    "$set": {
                        "avatar_url": None,
                        "avatar_public_id": None,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            logger.info(f"[Avatar Diagnostic - MongoDB Remove Result] matched={result.matched_count}, modified={result.modified_count}")

            updated_user = await db_manager.db["users"].find_one(query)
            if updated_user:
                updated_user["id"] = str(updated_user.get("_id") or updated_user.get("id"))
                return updated_user

        return {"id": user_id, "avatar_url": None, "avatar_public_id": None}

    @staticmethod
    async def change_password(user_id: str, data: PasswordChange) -> bool:
        if db_manager.db is not None:
            query = get_user_query(user_id)
            user = await db_manager.db["users"].find_one(query)
            if not user or not verify_password(data.current_password, user["hashed_password"]):
                raise UnauthorizedException(message="Current password does not match.")

            new_hashed = hash_password(data.new_password)
            await db_manager.db["users"].update_one(
                query,
                {"$set": {"hashed_password": new_hashed, "updated_at": datetime.now(timezone.utc)}}
            )
        return True
