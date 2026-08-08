from app.providers.ai.base import BaseAIProvider
from app.providers.ai.groq_provider import GroqProvider
from app.providers.ai.gemini_provider import GeminiProvider
from app.providers.ai.openai_provider import OpenAIProvider
from app.core.config import settings


def get_ai_provider(provider_name: str = None) -> BaseAIProvider:
    """Factory function returning active AI provider without changing business logic."""
    target = provider_name or settings.DEFAULT_AI_PROVIDER
    target = target.lower()

    if target == "groq":
        return GroqProvider()
    elif target == "gemini":
        return GeminiProvider()
    elif target == "openai":
        return OpenAIProvider()
    else:
        return GroqProvider()
