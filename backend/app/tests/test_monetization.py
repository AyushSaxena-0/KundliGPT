import pytest
import os
import json
from fastapi.testclient import TestClient
from app.services.newsletter import newsletter_service

@pytest.fixture(autouse=True)
def clean_local_newsletter():
    """
    Reset local subscriber list before and after tests.
    """
    temp_file = "local_db/test_subscribers.json"
    original_file = newsletter_service.provider.file_path
    
    newsletter_service.provider.file_path = temp_file
    if os.path.exists(temp_file):
        try:
            os.remove(temp_file)
        except OSError:
            pass
            
    yield
    
    newsletter_service.provider.file_path = original_file
    if os.path.exists(temp_file):
        try:
            os.remove(temp_file)
        except OSError:
            pass

@pytest.mark.asyncio
async def test_newsletter_service_mock_subscription():
    """
    Verify mock provider saves subscribers to JSON file correctly.
    """
    email = "test@example.com"
    name = "Test Subscriber"
    
    success = await newsletter_service.subscribe(email, name)
    assert success is True
    
    # Check that file was created and contains data
    assert os.path.exists(newsletter_service.provider.file_path)
    with open(newsletter_service.provider.file_path, "r") as f:
        data = json.load(f)
    assert len(data) == 1
    assert data[0]["email"] == email
    assert data[0]["name"] == name
    assert data[0]["verified"] is False

def test_api_newsletter_subscribe_endpoint(client: TestClient):
    """
    Verify API subscribe endpoint handles valid/invalid schemas correctly.
    """
    # 1. Invalid email validation (should return 400 Bad Request)
    res_err = client.post("/api/newsletter/subscribe", json={"email": "invalid-email-address", "name": "Fail"})
    assert res_err.status_code == 400
    
    # 2. Successful subscription (should return 200 OK)
    payload = {"email": "subscriber@domain.com", "name": "Rahul"}
    res_ok = client.post("/api/newsletter/subscribe", json=payload)
    assert res_ok.status_code == 200
    assert res_ok.json()["status"] == "success"
