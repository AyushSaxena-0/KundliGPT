from app.services.ai.providers.base import AIProvider
from app.services.ai.providers.gemini import GeminiProvider
from app.services.ai.providers.openai import OpenAIProvider
from app.services.ai.providers.anthropic import AnthropicProvider
from app.services.ai.providers.local import LocalProvider
from app.services.ai.config import ai_settings

def get_provider(name: str = None) -> AIProvider:
    """
    Factory function returning the configured or requested AIProvider instance.
    """
    provider_name = (name or ai_settings.AI_PROVIDER).lower()
    if provider_name == "openai":
        return OpenAIProvider()
    elif provider_name == "anthropic":
        return AnthropicProvider()
    elif provider_name == "local":
        return LocalProvider()
    else:
        return GeminiProvider()

# Active default provider singleton
ai_provider = get_provider()
