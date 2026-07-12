import time
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Request
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.gemini import gemini_service
from app.services.prompt_builder import prompt_builder
from app.utils.datetime_utils import get_formatted_utc_now
from app.utils.helpers import generate_uuid, sanitize_input
from app.middleware.auth import get_optional_user, AuthenticatedUser
from app.services.database import db_service
from app.config.config import settings

logger = logging.getLogger("app.routes.chat")
chat_router = APIRouter()

@chat_router.post(
    "/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat with the AI Vedic Astrologer",
    description="Sends a chat message to the Vedic Astrologer. Maintains state-free memory by accepting historical context and birth details."
)
async def chat(request: ChatRequest, fastapi_req: Request, user: Optional[AuthenticatedUser] = Depends(get_optional_user)):
    """
    Accepts birth details, conversation history, and the latest user message.
    Applies rate limiting, persists logs to database, queries Gemini, and logs usage statistics.
    """
    start_time = time.perf_counter()
    conv_id = request.conversationId or generate_uuid()

    # 1. Rate Limiting Check
    client_ip = fastapi_req.client.host if fastapi_req.client else "127.0.0.1"
    limit_key = user.id if user else client_ip
    msg_count = await db_service.get_usage_count(limit_key, "chat_message")
    if msg_count >= settings.RATE_LIMIT_MESSAGES_PER_DAY:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Daily chat message limit of {settings.RATE_LIMIT_MESSAGES_PER_DAY} exceeded. Please log in or upgrade."
        )

    logger.info(f"Processing chat request for Conversation ID: {conv_id}")

    try:
        # Process chat using the AIEngine pipeline
        from app.services.ai_engine import ai_engine
        from app.schemas.astrology import BirthDetails
        
        reply, extracted_details_dict = await ai_engine.process_chat(
            message=request.message,
            birth_details=request.birthDetails,
            history=request.history,
            conversation_id=conv_id
        )

        extracted_details = None
        if extracted_details_dict:
            # Reconstruct BirthDetails for validation before returning
            extracted_details = BirthDetails(**extracted_details_dict)

        # 2. Persist to Database if user is authenticated
        if user:
            # Check if conversation exists, otherwise create it
            existing_convs = await db_service.get_conversations(user.id)
            if not any(c["id"] == conv_id for c in existing_convs):
                title = request.message[:45] + "..." if len(request.message) > 45 else request.message
                await db_service.create_conversation(user.id, title=title)
            
            # Save user & assistant messages
            await db_service.save_message(conv_id, "user", request.message)
            await db_service.save_message(conv_id, "model", reply)

        # Measure execution latency
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        logger.info(f"Successfully generated astrology reply for Session: {conv_id} in {latency_ms}ms")

        # 3. Track Usage Metrics
        await db_service.track_usage(
            user_id=user.id if user else None,
            ip=client_ip,
            action="chat_message",
            endpoint="/chat",
            latency=latency_ms,
            status_code=200
        )

        return ChatResponse(
            reply=reply,
            timestamp=get_formatted_utc_now(),
            extractedDetails=extracted_details
        )

    except ValueError as val_err:
        # Prompt blocked by safety or validation failed inside services
        logger.warning(f"Validation error during chat generation for Session {conv_id}: {val_err}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )
    except RuntimeError as run_err:
        # Gemini API down, rate limits, or general service failures
        logger.error(f"Service error in Gemini processing for Session {conv_id}: {run_err}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Astrologer service temporarily unavailable: {str(run_err)}"
        )
    except Exception as exc:
        # Catch-all for unexpected backend failures (middleware handles actual response but we log here)
        logger.error(f"Unexpected error in chat endpoint for Session {conv_id}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating response."
        )

@chat_router.post(
    "/reset",
    status_code=status.HTTP_200_OK,
    summary="Create a new conversation session",
    description="Generates and returns a unique conversation ID to initiate a fresh context."
)
async def reset_session():
    """
    Generates a new conversation UUID.
    Useful for clients wanting to clear front-end state and start a new reading.
    """
    new_id = generate_uuid()
    logger.info(f"Initiated new conversation session: {new_id}")
    return {"conversationId": new_id}

@chat_router.get(
    "/debug/gemini",
    status_code=status.HTTP_200_OK,
    summary="Debug Gemini API connection",
    description="Diagnostics endpoint to test end-to-end Gemini client connectivity."
)
async def debug_gemini():
    """
    Diagnostic endpoint that tests API key availability, calls Gemini with a test prompt,
    measures latency, and returns the response or complete traceback on failure.
    """
    import time
    import traceback
    import google.genai
    from app.config import settings
    from app.services.ai.providers import ai_provider
    from app.services.ai.config import ai_settings
    
    start_time = time.perf_counter()
    api_key = settings.GEMINI_API_KEY
    api_key_loaded = bool(api_key and api_key != "mock_api_key_for_testing" and len(api_key) > 20)
    sdk_version = google.genai.__version__
    
    if not api_key_loaded:
        return {
            "success": False,
            "sdk_version": sdk_version,
            "model": ai_provider.model_name,
            "api_key_loaded": False,
            "latency_ms": 0,
            "error": "GEMINI_API_KEY is missing, invalid or too short (< 20 chars)."
        }

    try:
        test_prompt = "Reply with exactly: Hello from Gemini."
        response = await ai_provider.generate(
            prompt=test_prompt,
            system_instruction="You are a helpful test assistant."
        )
        
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        return {
            "success": True,
            "sdk_version": sdk_version,
            "model": ai_provider.model_name,
            "api_key_loaded": True,
            "latency_ms": latency_ms,
            "response": response.strip()
        }
    except Exception as exc:
        latency_ms = int((time.perf_counter() - start_time) * 1000)
        logger.exception("Debug Gemini call failed:")
        return {
            "success": False,
            "sdk_version": sdk_version,
            "model": ai_provider.model_name,
            "api_key_loaded": True,
            "latency_ms": latency_ms,
            "error": str(exc),
            "exception": traceback.format_exc()
        }
