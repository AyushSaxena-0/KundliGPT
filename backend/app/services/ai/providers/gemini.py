import logging
import asyncio
import time
import traceback
from typing import AsyncIterator, Dict, Any
from google import genai
from google.genai import types
from google.genai.errors import APIError

from app.services.ai.providers.base import AIProvider
from app.services.ai.config import ai_settings
from app.config import settings

logger = logging.getLogger("app.services.ai.providers.gemini")

def log_gemini_exception(logger_instance, exc: Exception, model_name: str, api_endpoint: str, latency: float):
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
        f"Gemini API Execution Exception:\n"
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

class GeminiProvider(AIProvider):
    """
    Modular Google GenAI SDK provider wrapper.
    """
    def __init__(self):
        # 1. Verify Environment
        api_key = ai_settings.GEMINI_API_KEY
        if api_key == "mock_api_key_for_testing" or not api_key:
            api_key = settings.GEMINI_API_KEY
            
        key_len = len(api_key) if api_key else 0
        logger.info(f"Loaded Gemini API key (length: {key_len})")
        
        if not api_key or key_len < 20:
            logger.error("Missing or invalid GEMINI_API_KEY environment variable.")
            
        # Initialize GenAI Client
        self.client = genai.Client(api_key=api_key)
        
        # Configure & Resolve Model
        configured_model = ai_settings.AI_MODEL or "gemini-3.5-flash"
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
            production_fallbacks = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-flash-lite-latest"]
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

    async def generate(self, prompt: str, system_instruction: str = None, config_override: Dict[str, Any] = None) -> str:
        temp = config_override.get("temperature", ai_settings.AI_TEMPERATURE) if config_override else ai_settings.AI_TEMPERATURE
        max_t = config_override.get("max_tokens", ai_settings.AI_MAX_TOKENS) if config_override else ai_settings.AI_MAX_TOKENS
        top_p = config_override.get("top_p", ai_settings.AI_TOP_P) if config_override else ai_settings.AI_TOP_P
        timeout = 30.0
        
        # Define model fallback chain to bypass quota (429) and not found (404) blocks dynamically
        primary_model = self.model_name
        fallback_chain = ["models/gemini-3.5-flash", "models/gemini-3.1-flash-lite", "models/gemini-flash-lite-latest"]
        
        # Reorder so primary_model is first in the chain
        if primary_model in fallback_chain:
            fallback_chain.remove(primary_model)
        fallback_chain.insert(0, primary_model)
            
        current_chain_index = 0
        backoff = 1.5
        max_attempts = 3 # initial + 2 retries
        
        for attempt in range(1, max_attempts + 1):
            model_to_use = fallback_chain[min(current_chain_index, len(fallback_chain) - 1)]
            start_time = time.perf_counter()
            try:
                logger.info(
                    "Gemini request starting | model=%s | prompt_chars=%s | temp=%s | max_tokens=%s | attempt=%s/%s",
                    model_to_use, len(prompt), temp, max_t, attempt, max_attempts
                )
                
                response = await asyncio.wait_for(
                    self.client.aio.models.generate_content(
                        model=model_to_use,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            temperature=temp,
                            max_output_tokens=max_t,
                            top_p=top_p
                        )
                    ),
                    timeout=timeout
                )
                
                latency = time.perf_counter() - start_time
                
                logger.info(
                    "Gemini response received | model=%s | latency=%.4fs | status=200",
                    model_to_use, latency
                )
                
                if not response.text:
                    logger.warning(f"Raw empty response object details: {response}")
                    raise ValueError("Response text body is empty.")
                    
                return response.text.strip()
                
            except APIError as e:
                latency = time.perf_counter() - start_time
                log_gemini_exception(logger, e, model_to_use, "/api/chat", latency)
                
                status_code = getattr(e, "code", None)
                
                # Quota (429) or Not Found (404): Advance fallback chain and retry
                if status_code in (429, 404):
                    current_chain_index += 1
                    if current_chain_index < len(fallback_chain):
                        next_model = fallback_chain[current_chain_index]
                        logger.warning(
                            f"Model '{model_to_use}' failed with status {status_code} on attempt {attempt}. "
                            f"Advancing fallback chain to: '{next_model}'..."
                        )
                        # Quick sleep and retry with next model
                        await asyncio.sleep(0.5)
                        continue
                    
                    if attempt == max_attempts:
                        raise RuntimeError("Gemini API Rate Limit / Quota reached. Fallbacks exhausted.") from e
                
                if attempt == max_attempts:
                    raise e
                await asyncio.sleep(backoff)
                backoff *= 1.5
                
            except asyncio.TimeoutError as e:
                latency = time.perf_counter() - start_time
                logger.error(f"Gemini Request TIMEOUT | limit={timeout}s | latency={latency:.4f}s")
                if attempt == max_attempts:
                    raise RuntimeError(f"Gemini request timed out after {timeout} seconds.") from e
                await asyncio.sleep(backoff)
                backoff *= 1.5
                
            except Exception as e:
                latency = time.perf_counter() - start_time
                log_gemini_exception(logger, e, model_to_use, "/api/chat", latency)
                if attempt == max_attempts:
                    raise e
                await asyncio.sleep(backoff)
                backoff *= 1.5
                
        return "Vedic interpretation unavailable."

    async def generate_stream(self, prompt: str, system_instruction: str = None, config_override: Dict[str, Any] = None) -> AsyncIterator[str]:
        temp = config_override.get("temperature", ai_settings.AI_TEMPERATURE) if config_override else ai_settings.AI_TEMPERATURE
        max_t = config_override.get("max_tokens", ai_settings.AI_MAX_TOKENS) if config_override else ai_settings.AI_MAX_TOKENS
        top_p = config_override.get("top_p", ai_settings.AI_TOP_P) if config_override else ai_settings.AI_TOP_P
        timeout = 30.0
        
        primary_model = self.model_name
        fallback_chain = ["models/gemini-3.5-flash", "models/gemini-3.1-flash-lite", "models/gemini-flash-lite-latest"]
        
        if primary_model in fallback_chain:
            fallback_chain.remove(primary_model)
        fallback_chain.insert(0, primary_model)
            
        current_chain_index = 0
        backoff = 1.5
        max_attempts = 3
        
        for attempt in range(1, max_attempts + 1):
            model_to_use = fallback_chain[min(current_chain_index, len(fallback_chain) - 1)]
            start_time = time.perf_counter()
            try:
                logger.info(
                    "Gemini stream request starting | model=%s | prompt_chars=%s | temp=%s | max_tokens=%s | attempt=%s/%s",
                    model_to_use, len(prompt), temp, max_t, attempt, max_attempts
                )
                
                response = await asyncio.wait_for(
                    self.client.aio.models.generate_content_stream(
                        model=model_to_use,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            system_instruction=system_instruction,
                            temperature=temp,
                            max_output_tokens=max_t,
                            top_p=top_p
                        )
                    ),
                    timeout=timeout
                )
                
                async for chunk in response:
                    if chunk.text:
                        yield chunk.text
                return
                
            except APIError as e:
                latency = time.perf_counter() - start_time
                log_gemini_exception(logger, e, model_to_use, "/api/chat (stream)", latency)
                
                status_code = getattr(e, "code", None)
                if status_code in (429, 404):
                    current_chain_index += 1
                    if current_chain_index < len(fallback_chain):
                        next_model = fallback_chain[current_chain_index]
                        logger.warning(
                            f"Model '{model_to_use}' failed with status {status_code} for stream. "
                            f"Advancing fallback chain to: '{next_model}'..."
                        )
                        await asyncio.sleep(0.5)
                        continue
                    if attempt == max_attempts:
                        yield " [Gemini API Rate Limit hit. Retries exhausted.] "
                        return
                
                if attempt == max_attempts:
                    yield f" [Gemini SDK Error: {str(e)}] "
                    return
                await asyncio.sleep(backoff)
                backoff *= 1.5
                
            except asyncio.TimeoutError as e:
                logger.error(f"Gemini Request Stream TIMEOUT | limit={timeout}s")
                if attempt == max_attempts:
                    yield " [Gemini stream request timed out.] "
                    return
                await asyncio.sleep(backoff)
                backoff *= 1.5
                
            except Exception as e:
                latency = time.perf_counter() - start_time
                log_gemini_exception(logger, e, model_to_use, "/api/chat (stream)", latency)
                if attempt == max_attempts:
                    yield f" [Stream interruption: {str(e)}] "
                    return
                await asyncio.sleep(backoff)
                backoff *= 1.5
