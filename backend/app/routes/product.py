from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.middleware.auth import get_current_user, get_admin_user, AuthenticatedUser
from app.services.database import db_service
from app.config.config import settings
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

product_router = APIRouter(prefix="/api")

# Schemas
class ProfileUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)

class BirthDetailInput(BaseModel):
    id: Optional[str] = None
    label: str = Field(..., example="Myself")
    name: str = Field(...)
    gender: Optional[str] = None
    date_of_birth: str = Field(..., description="YYYY-MM-DD")
    time_of_birth: str = Field(..., description="HH:MM")
    place_of_birth: str = Field(...)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timezone: Optional[str] = None

class SavedChartInput(BaseModel):
    label: str
    chart_data: Dict[str, Any] = Field(..., description="Raw computed JSON chart")

# ------------------ PROFILE CRUD ------------------
@product_router.get("/profile", summary="Get current user profile")
async def get_profile(user: AuthenticatedUser = Depends(get_current_user)):
    profile = await db_service.get_profile(user.id)
    if not profile:
        # Create profile lazily
        profile = await db_service.create_profile(user.id, user.email.split("@")[0], user.email)
    return profile

@product_router.put("/profile", summary="Update user profile name")
async def update_profile(data: ProfileUpdate, user: AuthenticatedUser = Depends(get_current_user)):
    profile = await db_service.update_profile(user.id, data.name)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found.")
    return profile

@product_router.delete("/profile/account", summary="Delete user account (cascading data wipe)")
async def delete_account(user: AuthenticatedUser = Depends(get_current_user)):
    success = await db_service.delete_account(user.id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to wipe account.")
    return {"status": "success", "message": "Account data successfully removed."}

@product_router.get("/profile/export", summary="GDPR Compliance: Export all user data as JSON")
async def export_data(user: AuthenticatedUser = Depends(get_current_user)):
    data = await db_service.export_user_data(user.id)
    return data

# ------------------ BIRTH DETAILS CRUD ------------------
@product_router.get("/birth-details", response_model=List[Dict[str, Any]], summary="List saved birth profiles")
async def get_birth_details(user: AuthenticatedUser = Depends(get_current_user)):
    return await db_service.get_saved_birth_details(user.id)

@product_router.post("/birth-details", summary="Create or overwrite a saved birth profile")
async def save_birth_details(data: BirthDetailInput, user: AuthenticatedUser = Depends(get_current_user)):
    try:
        return await db_service.save_birth_details(user.id, data.model_dump())
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@product_router.delete("/birth-details/{id}", summary="Delete a saved birth profile")
async def delete_birth_details(id: str, user: AuthenticatedUser = Depends(get_current_user)):
    success = await db_service.delete_birth_details(id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Profile record not found.")
    return {"status": "success", "message": "Profile removed successfully."}

# ------------------ CONVERSATIONS CRUD ------------------
@product_router.get("/conversations", response_model=List[Dict[str, Any]], summary="List active conversations")
async def get_conversations(user: AuthenticatedUser = Depends(get_current_user)):
    return await db_service.get_conversations(user.id)

@product_router.post("/conversations/{id}/rename", summary="Rename a chat session")
async def rename_conversation(id: str, title: ProfileUpdate, user: AuthenticatedUser = Depends(get_current_user)):
    conv = await db_service.rename_conversation(id, user.id, title.name)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return conv

@product_router.delete("/conversations/{id}", summary="Archive/Soft-delete a conversation")
async def delete_conversation(id: str, user: AuthenticatedUser = Depends(get_current_user)):
    success = await db_service.delete_conversation(id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Conversation not found.")
    return {"status": "success", "message": "Conversation removed."}

@product_router.get("/conversations/{id}/messages", response_model=List[Dict[str, Any]], summary="Get message list in a conversation")
async def get_messages(id: str, user: AuthenticatedUser = Depends(get_current_user)):
    # Verify ownership of conversation first
    convs = await db_service.get_conversations(user.id)
    if not any(c["id"] == id for c in convs):
        raise HTTPException(status_code=403, detail="Access denied. You do not own this session.")
    return await db_service.get_messages(id)

# ------------------ SAVED CHARTS CRUD ------------------
@product_router.get("/saved-charts", response_model=List[Dict[str, Any]], summary="List saved birth charts")
async def get_saved_charts(user: AuthenticatedUser = Depends(get_current_user)):
    return await db_service.get_saved_charts(user.id)

@product_router.post("/saved-charts", summary="Save a calculated birth chart")
async def save_chart(data: SavedChartInput, user: AuthenticatedUser = Depends(get_current_user)):
    return await db_service.save_chart(user.id, data.label, data.chart_data)

@product_router.delete("/saved-charts/{id}", summary="Delete a saved birth chart")
async def delete_chart(id: str, user: AuthenticatedUser = Depends(get_current_user)):
    success = await db_service.delete_saved_chart(id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Saved chart not found.")
    return {"status": "success", "message": "Saved chart deleted."}

# ------------------ ADMIN ANALYTICS ------------------
@product_router.get("/admin/analytics", summary="Get admin dashboard metrics")
async def get_admin_metrics(admin: AuthenticatedUser = Depends(get_admin_user)):
    return await db_service.get_admin_analytics()
