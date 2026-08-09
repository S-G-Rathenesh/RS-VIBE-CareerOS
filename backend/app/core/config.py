import os
import sys
from pathlib import Path
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Robust absolute path to backend/.env to ensure it loads regardless of CWD
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

_KNOWN_PLACEHOLDER_SECRET = "super-secret-key-change-in-production-min-32-chars-long"


class Settings(BaseSettings):
    """Centralized Application Configuration managed via Pydantic with fallback env aliases."""
    
    APP_NAME: str = "RS VIBE CareerOS AI"
    APP_ENV: str = "production"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("JWT_SECRET", os.getenv("SECRET_KEY", _KNOWN_PLACEHOLDER_SECRET))
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # Database (supports MONGODB_URI or MONGODB_URL)
    MONGODB_URL: str = os.getenv("MONGODB_URI", os.getenv("MONGODB_URL", "mongodb://localhost:27017"))
    MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "exploreme_ai")
    
    # CORS (supports FRONTEND_URL or ALLOWED_ORIGINS)
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://exploreme.ai",
        "https://exploreme-ai.vercel.app",
        "https://rsvibecareer.rathenesh.dev"
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        frontend_url = os.getenv("FRONTEND_URL")
        origins = [
            "https://rsvibecareer.rathenesh.dev",
            "https://exploreme.ai",
            "https://exploreme-ai.vercel.app"
        ]
        if frontend_url:
            origins.append(frontend_url)

        if isinstance(v, str):
            if v.startswith("["):
                import json
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        origins.extend(parsed)
                except Exception:
                    pass
            else:
                origins.extend([i.strip() for i in v.split(",")])
        elif isinstance(v, list):
            origins.extend(v)
            
        return list(set(origins))
        
    # Cloudinary
    CLOUDINARY_CLOUD_NAME: str = os.getenv("CLOUDINARY_CLOUD_NAME", "")
    CLOUDINARY_API_KEY: str = os.getenv("CLOUDINARY_API_KEY", "")
    CLOUDINARY_API_SECRET: str = os.getenv("CLOUDINARY_API_SECRET", "")
    CLOUDINARY_UPLOAD_PRESET: str = os.getenv("CLOUDINARY_UPLOAD_PRESET", "")
    
    # AI Services
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    DEFAULT_AI_PROVIDER: str = "groq"

    # Email Configuration (Resend)
    RESEND_API_KEY: str = os.getenv("RESEND_API_KEY", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@rsvibecareer.rathenesh.dev")
    FRONTEND_URL: str = os.getenv(
        "FRONTEND_URL",
        "https://rsvibecareer.rathenesh.dev" if os.getenv("APP_ENV", "production") == "production" else "http://localhost:5173"
    )

    # Razorpay Payment Gateway
    RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "")
    RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "")
    RAZORPAY_WEBHOOK_SECRET: str = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
    RAZORPAY_PLAN_ID: str = os.getenv("RAZORPAY_PLAN_ID", "")

    # Google Authentication
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")

    @field_validator("FRONTEND_URL", mode="after")
    @classmethod
    def validate_frontend_url(cls, v: str, info) -> str:
        app_env = info.data.get("APP_ENV", "production")
        if app_env.lower() == "production":
            if "localhost" in v or "127.0.0.1" in v:
                return "https://rsvibecareer.rathenesh.dev"
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()

# --- Production safety: refuse known placeholder SECRET_KEY in production ---
if (
    settings.APP_ENV.lower() == "production"
    and settings.SECRET_KEY == _KNOWN_PLACEHOLDER_SECRET
):
    print(
        "FATAL: SECRET_KEY is set to the known placeholder value. "
        "You MUST set a strong, unique SECRET_KEY in your .env or environment "
        "before running in production (APP_ENV=production).",
        file=sys.stderr,
    )
    sys.exit(1)

# --- Fail-fast validation for Google OAuth Client ID ---
if settings.GOOGLE_CLIENT_ID == "your_google_client_id_here":
    print(
        "WARNING: GOOGLE_CLIENT_ID is set to the placeholder value ('your_google_client_id_here'). "
        "Google OAuth will NOT work. Please configure a valid Web Application Client ID.",
        file=sys.stderr,
    )
