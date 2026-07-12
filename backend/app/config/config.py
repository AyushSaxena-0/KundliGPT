import os
from typing import List, Any
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

# Load env variables explicitly
load_dotenv()

class Settings(BaseSettings):
    """
    Application settings loaded from environment variables.
    Raises validation errors on startup if required variables are missing or invalid.
    """
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    GEMINI_API_KEY: str = Field(..., description="API key for Google Gemini")
    ALLOWED_ORIGINS: List[str] | str = Field(..., description="Comma-separated list of allowed CORS origins")
    ENVIRONMENT: str = Field("development", description="Application environment (development/production)")
    DEBUG: bool = Field(False, description="Debug mode flag")
    APP_NAME: str = Field("AI Vedic Astrologer", description="Name of the application")
    BACKEND_URL: str = Field("http://localhost:8000", description="Public URL of the backend")
    
    # Supabase Database Integration (Optional - falls back gracefully if empty)
    SUPABASE_URL: str = Field("", description="Supabase service endpoint URL")
    SUPABASE_KEY: str = Field("", description="Supabase anon public key")
    
    # Configurable Rate Limits
    RATE_LIMIT_MESSAGES_PER_DAY: int = Field(50, description="Max messages per user per day")
    RATE_LIMIT_CHARTS_PER_DAY: int = Field(10, description="Max charts per user per day")

    @field_validator("GEMINI_API_KEY", mode="before")
    @classmethod
    def validate_gemini_key(cls, value: str) -> str:
        if not value or value.strip() == "":
            raise ValueError("GEMINI_API_KEY cannot be empty.")
        return value.strip()

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, value: Any) -> List[str]:
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            import json
            # Attempt to parse as JSON list (in case it is formatted as a JSON array string)
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            except (json.JSONDecodeError, TypeError):
                pass
            
            # Fallback to comma-separated string splitting
            origins = [o.strip() for o in value.split(",") if o.strip()]
            if not origins:
                raise ValueError("ALLOWED_ORIGINS must contain at least one valid origin.")
            return origins
        raise ValueError("ALLOWED_ORIGINS must be a comma-separated string or a list.")

try:
    settings = Settings()
except Exception as e:
    import sys
    print(f"CRITICAL CONFIGURATION ERROR: Configuration validation failed during startup: {e}", file=sys.stderr)
    print("Please ensure all required variables are set in the .env file.", file=sys.stderr)
    sys.exit(1)
