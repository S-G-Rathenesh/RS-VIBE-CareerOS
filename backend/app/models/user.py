from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId


class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        return core_schema.json_or_python_schema(
            json_schema=core_schema.str_schema(),
            python_schema=core_schema.union_schema([
                core_schema.is_instance_schema(ObjectId),
                core_schema.chain_schema([
                    core_schema.str_schema(),
                    core_schema.no_info_plain_validator_function(cls.validate),
                ]),
            ]),
            serialization=core_schema.plain_serializer_function_ser_schema(
                lambda x: str(x)
            ),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)


class UserModel(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: EmailStr
    full_name: str
    hashed_password: str
    avatar_url: Optional[str] = None
    avatar_public_id: Optional[str] = None
    role: str = "candidate"  # "candidate" | "recruiter" | "admin"
    company_id: Optional[str] = None # For recruiters
    candidate_visibility: str = "public" # "public" | "recruiter_only" | "private"
    is_email_verified: bool = False
    auth_providers: List[str] = Field(default_factory=lambda: ["local"])
    google_sub: Optional[str] = None
    refresh_tokens: List[str] = []
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# Alias for convenience — many endpoints import "User" for type hints
User = UserModel
