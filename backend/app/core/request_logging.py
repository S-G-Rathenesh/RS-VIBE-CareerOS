import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request
from starlette.responses import Response

logger = logging.getLogger("exploreme_ai.request")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        start_time = time.time()
        
        # We can store the request ID in state for downstream access if needed
        request.state.request_id = request_id
        
        try:
            response = await call_next(request)
        except Exception as exc:
            # Let the exception handler catch it, but we can log the failure
            process_time = (time.time() - start_time) * 1000
            logger.error(
                f"req_id={request_id} method={request.method} path={request.url.path} "
                f"status=500 time={process_time:.2f}ms error=\"{str(exc)}\""
            )
            raise exc

        process_time = (time.time() - start_time) * 1000
        
        logger.info(
            f"req_id={request_id} method={request.method} path={request.url.path} "
            f"status={response.status_code} time={process_time:.2f}ms"
        )
        
        response.headers["X-Request-ID"] = request_id
        response.headers["X-Process-Time-Ms"] = f"{process_time:.2f}"
        return response
