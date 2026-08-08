from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from bson import ObjectId
from app.core.exceptions import UnauthorizedException, ForbiddenException
from app.security.jwt import decode_token
from app.database.mongodb import db_manager

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    """Dependency retrieving the authenticated user from JWT token."""
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise UnauthorizedException(message="Invalid token type")
        
    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException(message="Token payload invalid")
        
    if db_manager.db is None:
        raise UnauthorizedException(message="Database connection error")

    user = await db_manager.db["users"].find_one({"_id": user_id})
    if not user:
        # Fallback check if user_id is stored as ObjectId in Mongo
        try:
            user = await db_manager.db["users"].find_one({"_id": ObjectId(user_id)})
        except Exception:
            user = None

    if not user:
        raise UnauthorizedException(message="User not found")
        
    user["id"] = str(user["_id"])
    
    # Map legacy fields safely
    if "profile_image" in user and not user.get("avatar_url"):
        user["avatar_url"] = user.get("profile_image")

    return user


async def get_current_active_user(current_user: dict = Depends(get_current_user)) -> dict:
    return current_user


async def get_current_admin_user(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("role") != "admin":
        raise ForbiddenException(message="Admin privileges required")
    return current_user
