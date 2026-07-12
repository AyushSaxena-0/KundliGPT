import pytest
import os
import json
from fastapi.testclient import TestClient
from app.main import app
from app.services.feedback_store import feedback_store
from app.services.gemini import gemini_service
from unittest.mock import AsyncMock

@pytest.fixture(scope="module")
def client():
    """
    Returns a standard FastAPI TestClient for synchronous API endpoint requests.
    """
    with TestClient(app) as c:
        yield c

@pytest.fixture(autouse=True)
def setup_test_feedback_store():
    """
    Configures a temporary path for the feedback store during testing,
    and cleans it up after tests execute.
    """
    temp_feedback_file = "test_feedback.json"
    original_path = feedback_store.file_path
    
    # Override path
    feedback_store.file_path = temp_feedback_file
    feedback_store._init_store()
    
    yield
    
    # Restore original path and cleanup file
    feedback_store.file_path = original_path
    if os.path.exists(temp_feedback_file):
        try:
            os.remove(temp_feedback_file)
        except Exception:
            pass

@pytest.fixture
def mock_gemini_service(monkeypatch):
    """
    Mocks the Gemini API response generator to prevent outbound requests
    during testing and ensure consistent test outputs.
    """
    async_mock = AsyncMock(return_value="Based on the alignment of the stars, you have a constructive path ahead. Focus on discipline and consistency.")
    monkeypatch.setattr(gemini_service, "generate_response", async_mock)
    return async_mock
