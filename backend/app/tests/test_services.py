import pytest
import asyncio
from app.config import settings
from app.services.prompt_builder import prompt_builder
from app.services.feedback_store import feedback_store
from app.services.gemini import gemini_service
from app.schemas.astrology import BirthDetails
from app.schemas.chat import ChatHistoryItem
from app.schemas.feedback import FeedbackRequest
from unittest.mock import AsyncMock, patch
import json
import os

def test_settings_load():
    """
    Test that application settings load correctly.
    """
    assert settings.APP_NAME == "AI Vedic Astrologer"
    assert settings.ENVIRONMENT == "development"
    assert isinstance(settings.ALLOWED_ORIGINS, list)
    assert len(settings.ALLOWED_ORIGINS) > 0

def test_prompt_builder_system_prompt_loading():
    """
    Test that the PromptBuilder loaded a non-empty system prompt.
    """
    system_instr = prompt_builder.build_system_instruction()
    assert len(system_instr) > 0
    assert "Vedic Astrologer" in system_instr or "Jyotishi" in system_instr

def test_prompt_builder_composes_correctly():
    """
    Test that the prompt builder correctly formats birth details and history into user prompts.
    """
    birth = BirthDetails(
        name="Amit Patel",
        gender="Male",
        date_of_birth="1988-11-20",
        time_of_birth="23:15",
        place_of_birth="Ahmedabad, India",
        timezone="Asia/Kolkata"
    )
    history = [
        ChatHistoryItem(role="user", content="Will my health improve?"),
        ChatHistoryItem(role="model", content="I see planetary transits indicating improvement.")
    ]
    message = "What remedies do you recommend?"
    
    prompt = prompt_builder.build_user_prompt(
        message=message,
        birth_details=birth,
        history=history
    )
    
    # Assertions
    assert "### USER BIRTH DETAILS" in prompt
    assert "Amit Patel" in prompt
    assert "1988-11-20" in prompt
    assert "### CONVERSATION HISTORY" in prompt
    assert "User: Will my health improve?" in prompt
    assert "Astrologer: I see planetary transits indicating improvement." in prompt
    assert "### CURRENT USER MESSAGE" in prompt
    assert "User: What remedies do you recommend?" in prompt

@pytest.mark.asyncio
async def test_feedback_store_persistence():
    """
    Test that the FeedbackStore saves feedback accurately to the JSON file.
    """
    req = FeedbackRequest(
        rating=4,
        comment="Very insightful, but had minor latency.",
        conversationId="8f6a9c1e-f3b2-4d5c-b6e8-3a1b4c7d9e0f"
    )
    
    # Save feedback
    await feedback_store.save_feedback(req)
    
    # Retrieve contents directly from the file to inspect formatting
    assert os.path.exists(feedback_store.file_path)
    with open(feedback_store.file_path, "r", encoding="utf-8") as f:
        stored_data = json.load(f)
        
    assert len(stored_data) == 1
    assert stored_data[0]["conversation_id"] == req.conversationId
    assert stored_data[0]["rating"] == req.rating
    assert stored_data[0]["comment"] == req.comment
    assert "timestamp" in stored_data[0]

@pytest.mark.asyncio
async def test_gemini_service_retry_mechanism():
    """
    Test that GeminiService correctly throws error when all retries fail.
    """
    # Create a fresh service instance
    from google.genai.errors import ClientError
    
    # We patch generate_content to throw a ClientError with 429
    mock_error_call = AsyncMock(side_effect=ClientError(429, None, None))
    
    with patch.object(gemini_service.client.aio.models, "generate_content", mock_error_call):
        with pytest.raises(RuntimeError) as exc_info:
            # Call generate_response with short timeouts/backoffs for fast testing
            await gemini_service.generate_response(
                prompt="Hello", 
                system_instruction="Be helpful", 
                max_retries=2, 
                initial_backoff=0.01
            )
        assert "Rate Limit" in str(exc_info.value)
        assert mock_error_call.call_count == 2

@pytest.mark.asyncio
async def test_gemini_service_timeout_flow():
    """
    Test that GeminiService correctly times out and raises RuntimeError
    when requests exceed the timeout duration.
    """
    # Create a mock that sleeps to trigger the timeout
    async def mock_sleep_generate(*args, **kwargs):
        await asyncio.sleep(0.5)
        mock_response = AsyncMock()
        mock_response.text = "Hello"
        return mock_response

    mock_timeout_call = AsyncMock(side_effect=mock_sleep_generate)

    with patch.object(gemini_service.client.aio.models, "generate_content", mock_timeout_call):
        with pytest.raises(RuntimeError) as exc_info:
            await gemini_service.generate_response(
                prompt="Hello",
                system_instruction="Be helpful",
                max_retries=2,
                initial_backoff=0.01,
                timeout=0.05 # small timeout to trigger immediately
            )
        assert "timed out" in str(exc_info.value) or "network connection" in str(exc_info.value)
        assert mock_timeout_call.call_count == 2

