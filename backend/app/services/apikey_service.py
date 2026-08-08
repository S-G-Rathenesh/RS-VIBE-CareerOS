import secrets
import hashlib
from datetime import datetime, timezone
from typing import List, Optional
from pydantic import BaseModel
from app.database.mongodb import db_manager
from app.core.exceptions import APIException


class APIKeyItem(BaseModel):
    id: str
    key_prefix: str  # "sk_live_abc1...xyz9"
    name: str
    scopes: List[str]
    last_used_at: Optional[str] = None
    requests_count: int
    rate_limit: int
    created_at: str


class APIKeyService:
    """Enterprise Developer API Key Generation, Revocation, and Usage Tracking."""

    @classmethod
    async def generate_api_key(cls, user_id: str, name: str, scopes: List[str] = ["read"]) -> dict:
        """Generate a secure API key and store hashed key in database."""
        raw_key = f"sk_live_{secrets.token_urlsafe(32)}"
        hashed_key = hashlib.sha256(raw_key.encode()).hexdigest()
        key_prefix = f"{raw_key[:12]}...{raw_key[-4:]}"

        db = db_manager.db
        if db is None:
            raise APIException(status_code=500, message="Database unavailable.")

        doc = {
            "user_id": user_id,
            "name": name,
            "key_hash": hashed_key,
            "key_prefix": key_prefix,
            "scopes": scopes,
            "rate_limit": 1000,  # requests per hour
            "requests_count": 0,
            "last_used_at": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        res = await db["api_keys"].insert_one(doc)

        return {
            "id": str(res.inserted_id),
            "key": raw_key,  # Only revealed once on creation
            "key_prefix": key_prefix,
            "name": name,
            "scopes": scopes
        }

    @classmethod
    async def get_user_keys(cls, user_id: str) -> List[APIKeyItem]:
        """Fetch all API keys for user (hashed, prefix only)."""
        db = db_manager.db
        if db is None:
            return []

        cursor = db["api_keys"].find({"user_id": user_id}).sort("created_at", -1)
        docs = await cursor.to_list(length=50)

        return [
            APIKeyItem(
                id=str(doc.get("_id")),
                key_prefix=doc.get("key_prefix", ""),
                name=doc.get("name", ""),
                scopes=doc.get("scopes", []),
                last_used_at=doc.get("last_used_at"),
                requests_count=doc.get("requests_count", 0),
                rate_limit=doc.get("rate_limit", 1000),
                created_at=doc.get("created_at", "")
            )
            for doc in docs
        ]

    @classmethod
    async def revoke_api_key(cls, user_id: str, key_id: str) -> bool:
        """Revoke and delete an API key."""
        db = db_manager.db
        if db is not None:
            await db["api_keys"].delete_one({"_id": key_id, "user_id": user_id})
        return True

    @classmethod
    async def validate_api_key(cls, raw_key: str) -> Optional[dict]:
        """Validate an incoming API key against stored hashes."""
        hashed = hashlib.sha256(raw_key.encode()).hexdigest()
        db = db_manager.db
        if db is None:
            return None

        key_doc = await db["api_keys"].find_one({"key_hash": hashed})
        if key_doc:
            await db["api_keys"].update_one(
                {"_id": key_doc["_id"]},
                {
                    "$inc": {"requests_count": 1},
                    "$set": {"last_used_at": datetime.now(timezone.utc).isoformat()}
                }
            )
            return {"user_id": key_doc["user_id"], "scopes": key_doc.get("scopes", [])}
        return None
