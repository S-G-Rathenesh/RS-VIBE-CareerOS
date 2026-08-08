from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class BaseAIProvider(ABC):
    """Abstract Base AI Provider interface decoupling LLM vendor from business logic."""

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
    ) -> str:
        """Generate unstructured text completion."""
        pass

    @abstractmethod
    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Generate structured JSON payload."""
        pass
