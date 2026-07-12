import httpx
import json
import logging
from typing import AsyncIterator, Dict, Any
from app.services.ai.providers.base import AIProvider
from app.services.ai.config import ai_settings

logger = logging.getLogger("app.services.ai.providers.local")

class LocalProvider(AIProvider):
    """
    Open-source local LLM provider (Ollama, llama.cpp, LocalAI) using OpenAI compatibility endpoint structures.
    """
    def __init__(self):
        self.api_url = f"{ai_settings.LOCAL_API_BASE.rstrip('/')}/chat/completions"
        self.model = ai_settings.LOCAL_MODEL_NAME or "llama3"

    async def generate(self, prompt: str, system_instruction: str = None, config_override: Dict[str, Any] = None) -> str:
        temp = config_override.get("temperature", ai_settings.AI_TEMPERATURE) if config_override else ai_settings.AI_TEMPERATURE
        max_t = config_override.get("max_tokens", ai_settings.AI_MAX_TOKENS) if config_override else ai_settings.AI_MAX_TOKENS

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temp,
            "max_tokens": max_t
        }

        try:
            async with httpx.AsyncClient(timeout=ai_settings.AI_TIMEOUT) as client:
                res = await client.post(self.api_url, headers=headers, json=payload)
                if res.status_code != 200:
                    raise RuntimeError(f"Local model endpoint error {res.status_code}: {res.text}")
                return res.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.warning(f"Local provider connection failed: {e}. Falling back to default simulation.")
            return "Vedic local model offline. Planetary alignments indicate strong cosmic opportunities."

    async def generate_stream(self, prompt: str, system_instruction: str = None, config_override: Dict[str, Any] = None) -> AsyncIterator[str]:
        temp = config_override.get("temperature", ai_settings.AI_TEMPERATURE) if config_override else ai_settings.AI_TEMPERATURE
        max_t = config_override.get("max_tokens", ai_settings.AI_MAX_TOKENS) if config_override else ai_settings.AI_MAX_TOKENS

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temp,
            "max_tokens": max_t,
            "stream": True
        }

        try:
            async with httpx.AsyncClient(timeout=ai_settings.AI_TIMEOUT) as client:
                async with client.stream("POST", self.api_url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        yield " [Local model connection failed. Simulation active: Cosmic alignments favorable.] "
                        return
                    async for line in response.aiter_lines():
                        if line.startswith("data: "):
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                data = json.loads(data_str)
                                delta = data["choices"][0]["delta"]
                                if "content" in delta:
                                    yield delta["content"]
                            except Exception:
                                continue
        except Exception as e:
            logger.warning(f"Local stream failed: {e}")
            yield " [Local provider stream offline. Favorable alignments remain.] "
