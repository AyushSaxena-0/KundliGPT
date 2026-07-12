import logging
import asyncio
import time
import traceback
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.config import settings

logger = logging.getLogger("app.services.gemini")

def log_legacy_gemini_exception(logger_instance, exc: Exception, model_name: str, api_endpoint: str, latency: float):
    """
    Format and log detailed Gemini API errors, including response headers/bodies if available.
    """
    exc_type = type(exc).__name__
    exc_msg = str(exc)
    
    status_code = getattr(exc, "code", None)
    response_json = getattr(exc, "response_json", None)
    response_body = str(response_json) if response_json else None
    headers = None
    
    response_obj = getattr(exc, "response", None)
    if response_obj:
        headers = getattr(response_obj, "headers", None)
        if not response_body:
            response_body = getattr(response_obj, "text", None)
            
    tb_str = "".join(traceback.format_exception(type(exc), exc, exc.__traceback__))
    
    logger_instance.error(
        f"Legacy Gemini API Execution Exception:\n"
        f"- Exception Type: {exc_type}\n"
        f"- Exception Message: {exc_msg}\n"
        f"- Configured Model: {model_name}\n"
        f"- Target Endpoint: {api_endpoint}\n"
        f"- Latency: {latency:.4f}s\n"
        f"- HTTP Status Code: {status_code}\n"
        f"- HTTP Headers: {headers}\n"
        f"- Raw Response: {response_body}\n"
        f"- Traceback:\n{tb_str}"
    )

class GeminiService:
    """
    Dedicated service for communicating with Google's Gemini API.
    Handles configuration, retries, rate-limits, and clean response extraction.
    """
    def __init__(self):
        # 1. Verify Environment
        api_key = settings.GEMINI_API_KEY
        key_len = len(api_key) if api_key else 0
        logger.info(f"Loaded Gemini API key (length: {key_len})")
        
        if not api_key or key_len < 20:
            logger.error("Missing or invalid GEMINI_API_KEY environment variable.")
            
        # Initialize GenAI Client
        self.client = genai.Client(api_key=api_key)
        
        # Configure & Resolve Model
        configured_model = "gemini-3.5-flash"
        self.model_name = self._resolve_model(configured_model)

    def _resolve_model(self, requested_model: str) -> str:
        """
        Dynamically verifies that the requested model exists and fallback to production alternatives if not.
        """
        try:
            models_page = self.client.models.list()
            available_models = [m.name for m in models_page]
            
            norm_requested = requested_model.replace("models/", "")
            norm_avail = [m.replace("models/", "") for m in available_models]
            
            if norm_requested in norm_avail:
                idx = norm_avail.index(norm_requested)
                resolved = available_models[idx]
                if not resolved.startswith("models/"):
                    resolved = f"models/{resolved}"
                return resolved
                
            # If not found, search fallback models
            production_fallbacks = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-1.5-flash", "gemini-flash-latest"]
            for fb in production_fallbacks:
                if fb in norm_avail:
                    idx = norm_avail.index(fb)
                    fallback = available_models[idx]
                    if not fallback.startswith("models/"):
                        fallback = f"models/{fallback}"
                    logger.warning(f"Requested model '{requested_model}' is not supported. Switched to fallback: '{fallback}'")
                    return fallback
            
            # Default to prefixed requested_model
            return f"models/{norm_requested}"
        except Exception as e:
            norm_requested = requested_model.replace("models/", "")
            logger.warning(f"Failed to fetch available model list: {e}. Defaulting to 'models/{norm_requested}'")
            return f"models/{norm_requested}"

    async def generate_response(
        self, 
        prompt: str, 
        system_instruction: str = None, 
        max_retries: int = 3, 
        initial_backoff: float = 1.0,
        timeout: float = 30.0
    ) -> str:
        """
        Generates text content using Gemini model.
        Implements retries with exponential backoff for robustness.
        """
        model_to_use = self.model_name
        
        logger.info(
            "Legacy Gemini request starting | model=%s | prompt_chars=%s | timeout=%ss",
            model_to_use, len(prompt), timeout
        )
        
        backoff = initial_backoff
        
        for attempt in range(1, max_retries + 1):
            start_time = time.perf_counter()
            try:
                response = await asyncio.wait_for(
                    self.client.aio.models.generate_content(
                        model=model_to_use,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            temperature=0.7,
                            max_output_tokens=2048,
                        )
                    ),
                    timeout=timeout
                )
                
                latency = time.perf_counter() - start_time
                
                logger.info(
                    "Legacy Gemini response received | model=%s | latency=%.4fs | status=200",
                    model_to_use, latency
                )
                
                if not response.text:
                    logger.warning(f"Raw empty response object details: {response}")
                    raise ValueError("Response text body is empty.")
                    
                return response.text.strip()
                
            except APIError as e:
                latency = time.perf_counter() - start_time
                log_legacy_gemini_exception(logger, e, model_to_use, "/api/interpret", latency)
                
                status_code = getattr(e, "code", None)
                
                if status_code == 404:
                    fallback_model = "models/gemini-3.5-flash"
                    if model_to_use != fallback_model:
                         logger.warning(f"Model '{model_to_use}' returned 404. Attempting fallback '{fallback_model}'...")
                         model_to_use = fallback_model
                         self.model_name = fallback_model
                         continue
                
                if status_code == 429:
                    if attempt == max_retries:
                        raise RuntimeError("Gemini API Rate Limit hit. Retries exhausted.") from e
                    logger.warning(f"Rate limit (429) hit on attempt {attempt}. Retrying in {backoff}s...")
                    await asyncio.sleep(backoff)
                    backoff *= 2.0
                    continue
                    
                if attempt == max_retries:
                    raise e
                await asyncio.sleep(backoff)
                backoff *= 1.5
                
            except asyncio.TimeoutError as e:
                latency = time.perf_counter() - start_time
                logger.error(f"Legacy Gemini Request TIMEOUT | limit={timeout}s | latency={latency:.4f}s")
                if attempt == max_retries:
                    raise RuntimeError(f"Gemini request timed out after {timeout} seconds.") from e
                await asyncio.sleep(backoff)
                backoff *= 1.5
                
            except Exception as e:
                latency = time.perf_counter() - start_time
                log_legacy_gemini_exception(logger, e, model_to_use, "/api/interpret", latency)
                if attempt == max_retries:
                    raise e
                await asyncio.sleep(backoff)
                backoff *= 1.5
                
        return "Vedic interpretation unavailable."

# Singleton instance of GeminiService
gemini_service = GeminiService()
