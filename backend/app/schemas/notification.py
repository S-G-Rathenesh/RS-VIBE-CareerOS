from pydantic import BaseModel
from typing import Optional


class NotificationItem(BaseModel):
    id: str
    user_id: str
    type: str  # "resume_view", "portfolio_view", "interview_reminder", "subscription_reminder", "system_alert"
    title: str
    message: str
    read: bool
    link: Optional[str] = None
    created_at: str
