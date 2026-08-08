from typing import Optional, Dict, Any
from app.providers.ai.base import BaseAIProvider


class OpenAIProvider(BaseAIProvider):
    """OpenAI GPT-4o Provider Implementation Hook."""

    async def generate_text(self, prompt: str, system_prompt: Optional[str] = None, temperature: float = 0.7) -> str:
        return f"[OpenAI GPT-4o] {prompt}"

    async def generate_json(self, prompt: str, system_prompt: Optional[str] = None) -> Dict[str, Any]:
        return {"provider": "openai", "prompt": prompt}
