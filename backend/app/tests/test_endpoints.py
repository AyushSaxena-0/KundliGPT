from fastapi.testclient import TestClient
import uuid

def test_root_endpoint(client: TestClient):
    """
    Test that GET / returns the correct application name and metadata.
    """
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["appName"] == "AI Vedic Astrologer"
    assert "version" in data
    assert data["status"] == "online"
    assert "timestamp" in data

def test_health_endpoint(client: TestClient):
    """
    Test that GET /health returns status healthy and uptime.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "uptime" in data
    assert "uptimeSeconds" in data
    assert "version" in data

def test_reset_endpoint(client: TestClient):
    """
    Test that POST /api/reset returns a new conversationId.
    """
    response = client.post("/api/reset")
    assert response.status_code == 200
    data = response.json()
    assert "conversationId" in data
    # Ensure it's a valid UUID
    val = data["conversationId"]
    assert uuid.UUID(val)

def test_chat_endpoint_success(client: TestClient, mock_gemini_service):
    """
    Test successful chat completion flow.
    """
    payload = {
        "message": "Will I get a promotion this year?",
        "conversationId": str(uuid.uuid4()),
        "birthDetails": {
            "name": "Rahul Verma",
            "gender": "Male",
            "date_of_birth": "1990-05-15",
            "time_of_birth": "08:45",
            "place_of_birth": "Mumbai, India",
            "timezone": "Asia/Kolkata"
        },
        "history": [
            {"role": "user", "content": "Hello Astrologer"},
            {"role": "model", "content": "Hello Rahul. How may I guide you today?"}
        ]
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "timestamp" in data
    assert len(data["reply"]) > 0

def test_chat_endpoint_validation_errors(client: TestClient):
    """
    Test validation failures return HTTP 400 with meaningful details.
    """
    # Case 1: Empty message
    payload = {"message": "", "conversationId": str(uuid.uuid4())}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["type"] == "ValidationError"
    assert "message" in data["errors"][0]["field"]

    # Case 2: Message too long (max 2000)
    payload = {"message": "A" * 2001, "conversationId": str(uuid.uuid4())}
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400
    data = response.json()
    assert data["type"] == "ValidationError"

    # Case 3: Invalid Date of Birth calendar date
    payload = {
        "message": "Help me", 
        "conversationId": str(uuid.uuid4()),
        "birthDetails": {"date_of_birth": "1990-02-31"} # February 31st
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400
    assert "Invalid calendar date" in response.json()["errors"][0]["message"]

    # Case 4: Future Date of Birth
    payload = {
        "message": "Help me", 
        "conversationId": str(uuid.uuid4()),
        "birthDetails": {"date_of_birth": "2050-01-01"}
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400
    assert "cannot be in the future" in response.json()["errors"][0]["message"]

    # Case 5: Invalid Time of Birth
    payload = {
        "message": "Help me", 
        "conversationId": str(uuid.uuid4()),
        "birthDetails": {"time_of_birth": "25:61"} # Invalid hours & minutes
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 400

def test_feedback_endpoint_success(client: TestClient):
    """
    Test successful feedback recording.
    """
    payload = {
        "rating": 5,
        "comment": "Outstanding, very accurate guidance!",
        "conversationId": str(uuid.uuid4())
    }
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"

def test_feedback_endpoint_validation_errors(client: TestClient):
    """
    Test feedback validations on rating out of bounds and missing/malformed session ID.
    """
    # Rating too high
    payload = {"rating": 6, "comment": "Good", "conversationId": str(uuid.uuid4())}
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 400
    assert "rating" in response.json()["errors"][0]["field"]

    # Invalid conversationId uuid
    payload = {"rating": 4, "comment": "Good", "conversationId": "invalid-uuid-string"}
    response = client.post("/api/feedback", json=payload)
    assert response.status_code == 400
    assert "conversationId" in response.json()["errors"][0]["field"]
