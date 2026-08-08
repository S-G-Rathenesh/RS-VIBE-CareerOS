from fastapi import APIRouter
from app.schemas.response import APIResponse
from app.database.mongodb import db_manager
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=APIResponse)
async def health_check():
    """Real-time System Status Health Check for Backend, Database, AI Engine & Storage."""
    # 1. Database Connectivity Check
    db_connected = False
    try:
        if db_manager.client:
            await db_manager.client.admin.command("ping")
            db_connected = True
    except Exception:
        db_connected = False

    # 2. AI Engine Readiness Check
    ai_ready = bool(getattr(settings, "GROQ_API_KEY", "") or getattr(settings, "OPENAI_API_KEY", ""))

    # 3. Storage Configuration Check
    storage_ready = bool(getattr(settings, "CLOUDINARY_CLOUD_NAME", "") or getattr(settings, "STORAGE_BUCKET", ""))

    services_status = {
        "backend": "healthy",
        "database": "connected" if db_connected else "disconnected",
        "ai_engine": "ready" if ai_ready else "degraded",
        "storage": "ready" if storage_ready else "degraded"
    }

    return APIResponse.ok(
        data={
            "status": "healthy" if db_connected else "degraded",
            "app_name": settings.APP_NAME,
            "environment": settings.APP_ENV,
            "services": services_status,

            # Backwards compatibility fields
            "database_connected": db_connected,
            "ai_provider": settings.DEFAULT_AI_PROVIDER,
        }
    )
