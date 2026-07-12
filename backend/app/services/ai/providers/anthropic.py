import httpx
import json
import logging
from typing import AsyncIterator, Dict, Any
from app.services.ai.providers.base import AIProvider
from app.services.ai.config import ai_settings

logger = logging.getLogger("app.services.ai.providers.anthropic")

class AnthropicProvider(AIProvider):
    """
    Anthropic Claude API wrapper.
    """
    def __init__(self):
        self.api_key = ai_settings.ANTHROPIC_API_KEY
        self.model = ai_settings.AI_MODEL if "claude" in (ai_settings.AI_MODEL or "") else "claude-3-5-sonnet-20240620"
        self.api_url = "https://api.anthropic.com/v1/messages"

    async def generate(self, prompt: str, system_instruction: str = None, config_override: Dict[str, Any] = None) -> str:
        if not self.api_key:
            logger.warning("Anthropic API key missing. Returning offline simulation.")
            return "Planetary alignments indicate active cycles. Consult the configurations for deep alignments."

        temp = config_override.get("temperature", ai_settings.AI_TEMPERATURE) if config_override else ai_settings.AI_TEMPERATURE
        max_t = config_override.get("max_tokens", ai_settings.AI_MAX_TOKENS) if config_override else ai_settings.AI_MAX_TOKENS

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_t,
            "temperature": temp
        }
        if system_instruction:
            payload["system"] = system_instruction

        try:
            async with httpx.AsyncClient(timeout=ai_settings.AI_TIMEOUT) as client:
                res = await client.post(self.api_url, headers=headers, json=payload)
                if res.status_code != 200:
                    raise RuntimeError(f"Anthropic REST error {res.status_code}: {res.text}")
                return res.json()["content"][0]["text"]
        except Exception as e:
            logger.error(f"Anthropic generate failed: {e}")
            raise RuntimeError(f"Anthropic service unavailable: {str(e)}")

    async def generate_stream(self, prompt: str, system_instruction: str = None, config_override: Dict[str, Any] = None) -> AsyncIterator[str]:
        if not self.api_key:
            yield "Planetary alignments indicate active cycles. (Offline Simulation Mode)"
            return

        temp = config_override.get("temperature", ai_settings.AI_TEMPERATURE) if config_override else ai_settings.AI_TEMPERATURE
        max_t = config_override.get("max_tokens", ai_settings.AI_MAX_TOKENS) if config_override else ai_settings.AI_MAX_TOKENS

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_t,
            "temperature": temp,
            "stream": True
        }
        if system_instruction:
            payload["system"] = system_instruction

        try:
            async with httpx.AsyncClient(timeout=ai_settings.AI_TIMEOUT) as client:
                async with client.stream("POST", self.api_url, headers=headers, json=payload) as response:
                    if response.status_code != 200:
                        yield f" [Anthropic Connection Error: {response.status_code}] "
                        return
                    
                    event_type = ""
                    async for line in response.aiter_lines():
                        line = line.strip()
                        if line.startswith("event:"):
                            event_type = line[6:].strip()
                        elif line.startswith("data:"):
                            data_str = line[5:].strip()
                            if event_type == "content_block_delta":
                                try:
                                    data = json.loads(data_str)
                                    text = data.get("delta", {}).get("text", "")
                                    if text:
                                        yield text
                                except Exception:
                                    continue
        except Exception as e:
            logger.error(f"Anthropic stream failed: {e}")
            yield f" [Anthropic Streaming Exception: {str(e)}] "
