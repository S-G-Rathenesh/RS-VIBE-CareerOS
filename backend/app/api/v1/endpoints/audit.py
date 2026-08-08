from fastapi import APIRouter, Depends
from typing import List, Optional
from app.schemas.response import APIResponse
from app.services.audit_service import AuditLogItem, AuditLogService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=APIResponse[List[AuditLogItem]])
async def get_audit_logs(
    user_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Fetch compliance audit logs. Optionally filter by user_id."""
    logs = await AuditLogService.get_logs(user_id=user_id)
    return APIResponse.ok(data=logs)
