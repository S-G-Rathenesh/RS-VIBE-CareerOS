from fastapi import APIRouter, Depends
from typing import List
from app.schemas.response import APIResponse
from app.schemas.assistant import AssistantMessageRequest, AssistantMessageResponse, ConversationItem
from app.services.career_assistant_service import CareerAssistantService
from app.security.dependencies import get_current_user

router = APIRouter()


@router.post("/chat", response_model=APIResponse[AssistantMessageResponse])
async def chat_with_assistant(
    data: AssistantMessageRequest,
    current_user: dict = Depends(get_current_user)
):
    """Send a message to the AI Career Assistant. Uses your resume, portfolio, and profile data for personalized guidance."""
    res = await CareerAssistantService.chat(current_user["id"], data)
    return APIResponse.ok(data=res)


@router.get("/history", response_model=APIResponse[List[ConversationItem]])
async def get_conversation_history(current_user: dict = Depends(get_current_user)):
    """Fetch AI Career Assistant conversation history."""
    history = await CareerAssistantService.get_history(current_user["id"])
    return APIResponse.ok(data=history)


@router.delete("/history", response_model=APIResponse)
async def clear_conversation_history(current_user: dict = Depends(get_current_user)):
    """Clear all AI Career Assistant conversation history."""
    await CareerAssistantService.clear_history(current_user["id"])
    return APIResponse.ok(data={"message": "Conversation history cleared."})
