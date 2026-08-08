from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request


class WildcardSubdomainMiddleware(BaseHTTPMiddleware):
    """
    Subdomain routing middleware prepared for future wildcard DNS deployments.
    Maps request hosts like 'alexvance.exploreme.ai' -> '/p/alexvance'.
    """
    async def dispatch(self, request: Request, call_next):
        host = request.headers.get("host", "").split(":")[0]
        base_domain = "exploreme.ai"

        if host.endswith(f".{base_domain}") and host != f"www.{base_domain}":
            subdomain = host.replace(f".{base_domain}", "")
            if subdomain and not request.url.path.startswith("/api"):
                # Rewrite path internally to public portfolio slug route
                request.scope["path"] = f"/p/{subdomain}"

        response = await call_next(request)
        return response
