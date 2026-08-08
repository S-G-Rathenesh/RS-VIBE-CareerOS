from typing import Any, Dict, Optional
from fastapi import HTTPException, status, Request
from fastapi.responses import JSONResponse


class APIException(HTTPException):
    """Custom Base HTTP Exception class for structured error responses."""
    def __init__(
        self,
        status_code: int,
        message: str,
        code: str = "BAD_REQUEST",
        details: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None,
    ):
        super().__init__(status_code=status_code, detail=message, headers=headers)
        self.message = message
        self.code = code
        self.details = details


class UnauthorizedException(APIException):
    def __init__(self, message: str = "Could not validate credentials", code: str = "UNAUTHORIZED", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message=message,
            code=code,
            details=details,
            headers={"WWW-Authenticate": "Bearer"},
        )


class ForbiddenException(APIException):
    def __init__(self, message: str = "Access forbidden", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            message=message,
            code="FORBIDDEN",
            details=details,
        )


class NotFoundException(APIException):
    def __init__(self, message: str = "Requested resource not found", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=message,
            code="NOT_FOUND",
            details=details,
        )


class ConflictException(APIException):
    def __init__(self, message: str = "Resource conflict", code: str = "CONFLICT", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            message=message,
            code=code,
            details=details,
        )


class BadRequestException(APIException):
    def __init__(self, message: str = "Invalid request payload", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=message,
            code="BAD_REQUEST",
            details=details,
        )


class InternalServerErrorException(APIException):
    def __init__(self, message: str = "Internal server error occurred", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            message=message,
            code="INTERNAL_SERVER_ERROR",
            details=details,
        )


class ServiceUnavailableException(APIException):
    def __init__(self, message: str = "Service unavailable", details: Optional[Any] = None):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            message=message,
            code="SERVICE_UNAVAILABLE",
            details=details,
        )


async def api_exception_handler(request: Request, exc: APIException) -> JSONResponse:
    """Global handler for custom API exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
                "details": exc.details,
            },
            "data": None,
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global fallback handler for unhandled exceptions."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected error occurred. Please try again later.",
                "details": str(exc) if hasattr(exc, "__str__") else None,
            },
            "data": None,
        },
    )
