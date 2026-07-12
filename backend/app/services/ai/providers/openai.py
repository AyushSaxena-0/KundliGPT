import httpx
import json
import logging
from typing import AsyncIterator, Dict, Any
from app.services.ai.providers.base import AIProvider
from app.services.ai.config import ai_settings

logger = logging.getLogger("app.services.ai.providers.openai")

class OpenAIProvider(AIProvider):
    """
    OpenAI REST API implementation of the swappable AIProvider interface.
    """
    def __init__(self):
        self.api_key = ai_settings.OPENAI_API_KEY
        self.model = ai_settings.AI_MODEL if "gpt" in (ai_settings.AI_MODEL or "") else "gpt-4o-mini"
        self.api_url = "https://api.openai.com/v1/chat/completions"

    async def generate(self, prompt: str, system_instruction: str = None, config_override: Dict[str, Any] = None) -> str:
        if not self.api_key:
            logger.warning("OpenAI API key missing. Returning offline simulation.")
            return "Planetary alignments indicate active cycles. Consult the configurations for deep alignments."

        temp = config_override.get("temperature", ai_settings.AI_TEMPERATURE) if config_override else ai_settings.AI_TEMPERATURE
        max_t = config_override.get("max_tokens", ai_settings.AI_MAX_TOKENS) if config_override else ai_settings.AI_MAX_TOKENS
        top_p = config_override.get("top_p", ai_settings.AI_TOP_P) if config_override else ai_settings.AI_TOP_P

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temp,
            "max_tokens": max_t,
            "top_p": top_p
        }

        try:
            async with httpx.AsyncClient(timeout=ai_settings.AI_TIMEOUT) as client:
                res = await client.post(self.api_url, headers=headers, json=payload)
                if res.status_code != 200:
                    raise RuntimeError(f"OpenAI REST error {res.status_code}: {res.text}")
                return res.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"OpenAI generate failed: {e}")
            raise RuntimeError(f"OpenAI service unavailable: {str(e)}")

    async def generate_stream(self, prompt: str, system_instruction: str = None, config_override: Dict[str, Any] = None) -> AsyncIterator[str]:
        if not self.api_key:
            yield "Planetary alignments indicate active cycles. (Offline Simulation Mode)"
            return

        temp = config_override.get("temperature", ai_settings.AI_TEMPERATURE) if config_override else ai_settings.AI_TEMPERATURE
        max_t = config_override.get("max_tokens", ai_settings.AI_MAX_TOKENS) if config_override else ai_settings.AI_MAX_TOKENS
        top_p = config_override.get("top_p", ai_settings.AI_TOP_P) if config_override else ai_settings.AI_TOP_P

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temp,
            "max_tokens": max_t,
            "top_p": top_p,
            "stream": True
        }

        try:
            async with httpx.AsyncClient(timeout=ai_settings.AI_TIMEOUT) as client:
                async with client.stream("POST", self.api_url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        yield f" [OpenAI API Connection Error: {response.status_code}] "
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
            logger.error(f"OpenAI stream failed: {e}")
            yield f" [OpenAI Streaming Exception: {str(e)}] "
