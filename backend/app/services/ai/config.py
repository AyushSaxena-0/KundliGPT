import os
from pydantic_settings import BaseSettings
from typing import Optional

class AISettings(BaseSettings):
    """
    Independent configuration schema for the AI layer.
    """
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-3.5-flash")
    AI_TEMPERATURE: float = float(os.getenv("AI_TEMPERATURE", "0.7"))
    AI_MAX_TOKENS: int = int(os.getenv("AI_MAX_TOKENS", "2048"))
    AI_TOP_P: float = float(os.getenv("AI_TOP_P", "0.95"))
    AI_RETRY_COUNT: int = int(os.getenv("AI_RETRY_COUNT", "2"))
    AI_TIMEOUT: float = float(os.getenv("AI_TIMEOUT", "12.0"))
    AI_STREAMING_ENABLED: bool = os.getenv("AI_STREAMING_ENABLED", "true").lower() == "true"
    
    # API Keys & URLs
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")
    ANTHROPIC_API_KEY: Optional[str] = os.getenv("ANTHROPIC_API_KEY")
    LOCAL_API_BASE: str = os.getenv("LOCAL_API_BASE", "http://localhost:11434/v1")
    LOCAL_MODEL_NAME: str = os.getenv("LOCAL_MODEL_NAME", "llama3")

    class Config:
        env_prefix = "AI_"
        case_sensitive = True

ai_settings = AISettings()
