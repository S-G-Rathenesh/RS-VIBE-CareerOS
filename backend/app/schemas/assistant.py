from pydantic import BaseModel
from typing import List, Optional


class AssistantMessageRequest(BaseModel):
    message: str
    context_type: Optional[str] = "general"  # "general", "resume", "portfolio", "interview", "career"


class AssistantMessageResponse(BaseModel):
    response: str
    context_used: List[str]
    credits_deducted: int
    conversation_id: str


class ConversationItem(BaseModel):
    id: str
    role: str  # "user" or "assistant"
    content: str
    context_type: str
    timestamp: str
