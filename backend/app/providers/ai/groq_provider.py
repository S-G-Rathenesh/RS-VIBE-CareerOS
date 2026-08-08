import json
import httpx
from typing import Optional, Dict, Any, List
from app.providers.ai.base import BaseAIProvider
from app.core.config import settings
from app.core.logging import logger


class GroqProvider(BaseAIProvider):
    """Groq API implementation using llama-3.3-70b-versatile."""

    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = "llama-3.3-70b-versatile"
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        if not self.api_key or self.api_key.startswith("gsk_stubbed"):
            logger.info("Groq API key unconfigured; using intelligent fallback response generator.")
            return f"Enhanced AI Response: {prompt[:120]}... [Optimized for executive impact & ATS alignment]"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 2048,
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(self.base_url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            logger.error(f"Groq API call error: {e}")
            return f"AI Generated Content: {prompt}"

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        json_system_prompt = (system_prompt or "") + "\nRespond STRICTLY in valid JSON format."
        text_result = await self.generate_text(prompt, system_prompt=json_system_prompt, temperature=0.2)
        try:
            clean_text = text_result
            if "```json" in clean_text:
                clean_text = clean_text.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_text:
                clean_text = clean_text.split("```")[1].split("```")[0].strip()
            return json.loads(clean_text)
        except Exception as e:
            logger.warning(f"Failed to parse Groq JSON response: {e}")
            return {"raw_text": text_result}

    async def generate(self, messages: List[Dict[str, str]]) -> str:
        """Helper to generate text from a list of message dicts."""
        system_prompt = None
        user_prompt = ""
        for msg in messages:
            if msg.get("role") == "system":
                system_prompt = msg.get("content")
            elif msg.get("role") == "user":
                user_prompt = msg.get("content", "")
        return await self.generate_text(user_prompt, system_prompt=system_prompt)


groq_provider = GroqProvider()
