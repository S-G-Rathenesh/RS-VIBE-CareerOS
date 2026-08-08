from typing import Generic, Optional, TypeVar, Any
from pydantic import BaseModel

T = TypeVar("T")


class APIErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Any] = None


class APIResponse(BaseModel, Generic[T]):
    """Standardized API Response Schema for all FastAPI endpoints."""
    success: bool = True
    data: Optional[T] = None
    error: Optional[APIErrorDetail] = None
    meta: Optional[dict] = None

    @classmethod
    def ok(cls, data: Any = None, meta: Optional[dict] = None) -> "APIResponse":
        return cls(success=True, data=data, meta=meta, error=None)

    @classmethod
    def fail(cls, code: str, message: str, details: Optional[Any] = None) -> "APIResponse":
        return cls(
            success=False,
            data=None,
            error=APIErrorDetail(code=code, message=message, details=details)
        )

    @classmethod
    def respond(cls, data: Any = None, message: str = "", meta: Optional[dict] = None) -> "APIResponse":
        """Alias for ok() with an optional message field (ignored in response body)."""
        return cls(success=True, data=data, meta=meta, error=None)
