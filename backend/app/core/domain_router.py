from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.database.mongodb import db_manager


class CustomDomainRoutingMiddleware(BaseHTTPMiddleware):
    """
    Middleware intercepting custom domain Host headers (e.g. 'myportfolio.com')
    and transparently serving the mapped user's public portfolio.
    """

    async def dispatch(self, request: Request, call_next):
        host = request.headers.get("host", "").split(":")[0].lower()

        # Skip standard system hostnames
        if host not in ["localhost", "127.0.0.1", "exploreme.ai", "api.exploreme.ai", "exploreme-ai.vercel.app"]:
            db = db_manager.db
            if db is not None:
                domain_doc = await db["custom_domains"].find_one({"domain": host, "verified": True})
                if domain_doc:
                    # Dynamically append target portfolio slug to request scope
                    portfolio_slug = domain_doc.get("portfolio_slug")
                    request.scope["path"] = f"/api/v1/public/portfolios/{portfolio_slug}"

        return await call_next(request)
