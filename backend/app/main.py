from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging, logger
from app.core.exceptions import APIException, api_exception_handler, generic_exception_handler
from app.core.security_headers import SecurityHeadersMiddleware
from app.core.rate_limit import RateLimitMiddleware, add_rate_limiter
from app.core.subdomain import WildcardSubdomainMiddleware
from app.core.domain_router import CustomDomainRoutingMiddleware
from app.core.caching import ResponseCachingMiddleware
from app.core.request_logging import RequestLoggingMiddleware
from app.core.request_logging import RequestLoggingMiddleware
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.indexes import create_database_indexes
from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown tasks."""
    setup_logging()
    logger.info("Initializing RS VIBE CareerOS Backend Engine...")
    await connect_to_mongo()
    await create_database_indexes()
    from app.providers.storage import get_storage_provider
    get_storage_provider().test_cloudinary_connection()
    
    # Safe diagnostic for Google OAuth Client ID
    google_id = settings.GOOGLE_CLIENT_ID
    if google_id and len(google_id) > 6:
        logger.info(f"Google OAuth initialized (Client ID length: {len(google_id)}, ends with: {google_id[-6:]})")
    elif google_id:
        logger.info(f"Google OAuth initialized (Client ID length: {len(google_id)}, too short to mask)")
    else:
        logger.warning("Google OAuth Client ID is MISSING or EMPTY")
        
    yield
    logger.info("Shutting down RS VIBE CareerOS Backend Engine...")
    await close_mongo_connection()


app = FastAPI(
    title=settings.APP_NAME,
    description="Production AI-powered Career, Resume & Portfolio Platform API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Add SlowAPI rate limiter
add_rate_limiter(app)

# Register Security, Caching, Domain, Rate Limiting, and Logging Middlewares
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)
app.add_middleware(ResponseCachingMiddleware)
app.add_middleware(WildcardSubdomainMiddleware)
app.add_middleware(CustomDomainRoutingMiddleware)

# Set CORS middleware
if settings.ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register custom exception handlers
app.add_exception_handler(APIException, api_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Register routers
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API Engine",
        "docs": "/docs" if settings.DEBUG else "Disabled",
        "health": f"{settings.API_V1_STR}/health",
    }
