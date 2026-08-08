from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class ResponseCachingMiddleware(BaseHTTPMiddleware):
    """Adds HTTP Cache Control headers for public endpoints."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/api/v1/public"):
            response.headers["Cache-Control"] = "public, max-age=300, stale-while-revalidate=60"
        return response
