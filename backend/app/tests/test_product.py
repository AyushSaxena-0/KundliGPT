import pytest
import os
import shutil
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.services.database import db_service
from app.middleware.auth import AuthenticatedUser, get_current_user
from unittest.mock import AsyncMock, patch

@pytest.fixture(autouse=True)
def clean_local_db():
    """
    Cleans and resets mock local JSON files before each test to prevent cross-test pollution.
    """
    if os.path.exists("local_db"):
        shutil.rmtree("local_db")
    os.makedirs("local_db", exist_ok=True)
    db_service._init_local_files()

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def mock_user():
    return AuthenticatedUser(
        id=f"usr-test-{uuid.uuid4()}",
        email="testuser@example.com",
        is_admin=True
    )

@pytest.mark.asyncio
async def test_db_profile_crud(mock_user):
    """
    Test direct database profile CRUD operations in local fallback mode.
    """
    # 1. Create Profile
    prof = await db_service.create_profile(mock_user.id, "Test User", mock_user.email)
    assert prof["id"] == mock_user.id
    assert prof["name"] == "Test User"
    
    # 2. Get Profile
    fetched = await db_service.get_profile(mock_user.id)
    assert fetched is not None
    assert fetched["name"] == "Test User"
    
    # 3. Update Profile
    updated = await db_service.update_profile(mock_user.id, "Updated User Name")
    assert updated["name"] == "Updated User Name"

@pytest.mark.asyncio
async def test_db_birth_details_crud(mock_user):
    """
    Test saving, listing, and deleting birth profile detail records in database.
    """
    payload = {
        "id": "birth-rec-111",
        "label": "Myself",
        "name": "Rahul Verma",
        "date_of_birth": "1990-05-15",
        "time_of_birth": "08:45:00",
        "place_of_birth": "Mumbai, India",
        "latitude": 19.07,
        "longitude": 72.87,
        "timezone": "Asia/Kolkata"
    }
    
    # Pre-requisite: Create profile
    await db_service.create_profile(mock_user.id, "Test User", mock_user.email)
    
    # 1. Create Saved Record
    saved = await db_service.save_birth_details(mock_user.id, payload)
    assert saved["id"] == "birth-rec-111"
    assert saved["label"] == "Myself"
    
    # 2. Get saved records
    records = await db_service.get_saved_birth_details(mock_user.id)
    assert len(records) > 0
    assert records[0]["name"] == "Rahul Verma"
    
    # 3. Delete Record
    success = await db_service.delete_birth_details("birth-rec-111", mock_user.id)
    assert success is True
    
    # Verify soft-delete filter
    empty_records = await db_service.get_saved_birth_details(mock_user.id)
    assert len(empty_records) == 0

@pytest.mark.asyncio
async def test_db_conversations_and_messages(mock_user):
    """
    Test creating chats, saving messages, and checking history logs.
    """
    # Pre-requisite: Create profile
    await db_service.create_profile(mock_user.id, "Test User", mock_user.email)

    # 1. Create Conversation
    conv = await db_service.create_conversation(mock_user.id, "Test Consultation", "Ascendant Leo, Moon Aries")
    conv_id = conv["id"]
    assert conv["title"] == "Test Consultation"
    
    # 2. Save Messages
    msg_user = await db_service.save_message(conv_id, "user", "What is my lagna?")
    msg_model = await db_service.save_message(conv_id, "model", "Your Lagna is Leo.")
    
    # 3. Fetch Messages
    messages = await db_service.get_messages(conv_id)
    assert len(messages) == 2
    assert messages[0]["role"] == "user"
    assert messages[1]["content"] == "Your Lagna is Leo."
    
    # 4. Cleanup
    deleted = await db_service.delete_conversation(conv_id, mock_user.id)
    assert deleted is True

def test_api_profile_endpoints(client: TestClient, mock_user):
    """
    Verify GET & PUT /api/profile endpoints behave correctly with mocked auth.
    """
    # Pre-create profile
    import asyncio
    asyncio.run(db_service.create_profile(mock_user.id, "Test User", mock_user.email))

    # Override authentication dependency to return mock_user
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    # 1. Get profile
    res = client.get("/api/profile")
    assert res.status_code == 200
    data = res.json()
    assert "email" in data
    assert data["id"] == mock_user.id
    
    # 2. Update profile name
    res_update = client.put("/api/profile", json={"name": "New Dynamic Name"})
    assert res_update.status_code == 200
    assert res_update.json()["name"] == "New Dynamic Name"
    
    # Restore dependencies overrides
    app.dependency_overrides.clear()

def test_api_admin_analytics_endpoints(client: TestClient, mock_user):
    """
    Verify GET /api/admin/analytics returns metrics summary block.
    """
    # Pre-create profile
    import asyncio
    asyncio.run(db_service.create_profile(mock_user.id, "Test User", mock_user.email))

    # Override auth to pass is_admin=True user
    app.dependency_overrides[get_current_user] = lambda: mock_user
    
    res = client.get("/api/admin/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "totalUsers" in data
    assert "totalConversations" in data
    assert "averageRating" in data
    
    app.dependency_overrides.clear()

def test_api_saved_charts(client: TestClient, mock_user):
    """
    Verify Saved Charts CRUD operations.
    """
    import asyncio
    asyncio.run(db_service.create_profile(mock_user.id, "Test User", mock_user.email))
    app.dependency_overrides[get_current_user] = lambda: mock_user

    # 1. Save Chart
    payload = {
        "label": "My Birth Chart",
        "chart_data": {"ascendant": "Virgo", "moon": "Scorpio"}
    }
    res = client.post("/api/saved-charts", json=payload)
    assert res.status_code == 200
    chart_id = res.json()["id"]
    assert res.json()["label"] == "My Birth Chart"

    # 2. Get Saved Charts
    res_get = client.get("/api/saved-charts")
    assert res_get.status_code == 200
    assert len(res_get.json()) > 0
    assert res_get.json()[0]["label"] == "My Birth Chart"

    # 3. Delete Saved Chart
    res_del = client.delete(f"/api/saved-charts/{chart_id}")
    assert res_del.status_code == 200
    assert res_del.json()["status"] == "success"

    app.dependency_overrides.clear()

def test_api_account_export_and_delete(client: TestClient, mock_user):
    """
    Verify profile export and deletion endpoints.
    """
    import asyncio
    asyncio.run(db_service.create_profile(mock_user.id, "Test User", mock_user.email))
    app.dependency_overrides[get_current_user] = lambda: mock_user

    # 1. Export personal data
    res_export = client.get("/api/profile/export")
    assert res_export.status_code == 200
    assert "profile" in res_export.json()
    assert "savedBirthDetails" in res_export.json()

    # 2. Delete account
    res_del = client.delete("/api/profile/account")
    assert res_del.status_code == 200
    assert res_del.json()["status"] == "success"

    # 3. Confirm profile is deleted
    profile = asyncio.run(db_service.get_profile(mock_user.id))
    assert profile is None

    app.dependency_overrides.clear()
