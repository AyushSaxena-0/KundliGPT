from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from app.schemas.astrology import BirthDetails
import uuid

class ChatHistoryItem(BaseModel):
    """
    Represents a single message in the conversation history.
    """
    role: str = Field(..., description="Role of the speaker (user, model, assistant)", example="user")
    content: str = Field(..., description="Content of the message", example="Hello, I want to know about my career.")

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        role_lower = value.strip().lower()
        allowed_roles = {"user", "model", "assistant", "system"}
        if role_lower not in allowed_roles:
            raise ValueError(f"Role must be one of {allowed_roles}")
        # Normalize assistant to model since Gemini uses model
        if role_lower == "assistant":
            return "model"
        return role_lower

    @field_validator("content")
    @classmethod
    def validate_content(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Message content cannot be empty.")
        if len(stripped) > 4000:
            raise ValueError("Message content is too long. Max 4000 characters.")
        return stripped

class ChatRequest(BaseModel):
    """
    Request schema for sending a chat message to the astrologer.
    """
    message: str = Field(..., description="The user's input message to the astrologer", example="What does my career look like?")
    conversationId: Optional[str] = Field(None, description="UUID identifying the conversation session", example="d3b07384-d113-4956-a5db-e8c14c5b6b1a")
    birthDetails: Optional[BirthDetails] = Field(default_factory=BirthDetails, description="Collected birth details of the user")
    history: List[ChatHistoryItem] = Field(default_factory=list, description="Recent conversation history to maintain context")

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Message cannot be empty.")
        if len(stripped) > 2000:
            raise ValueError("Message is too long. Max 2000 characters to prevent prompt injection or overload.")
        return stripped

    @field_validator("conversationId")
    @classmethod
    def validate_conversation_id(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped:
            raise ValueError("conversationId cannot be an empty string.")
        try:
            # Validate if it's a valid UUID string
            uuid.UUID(stripped)
        except ValueError:
            raise ValueError("conversationId must be a valid UUID.")
        return stripped

    @field_validator("history")
    @classmethod
    def validate_history_size(cls, value: List[ChatHistoryItem]) -> List[ChatHistoryItem]:
        if len(value) > 100:  # Allow up to 100 turns (50 user, 50 assistant)
            raise ValueError("Conversation history is too large. Maximum history size is 100 messages.")
        return value

class ChatResponse(BaseModel):
    """
    Response schema returned by the chat endpoint.
    """
    reply: str = Field(..., description="The astrologer's response", example="Based on your birth chart...")
    timestamp: str = Field(..., description="ISO 8601 formatted timestamp of the reply", example="2026-07-11T23:14:03Z")
    extractedDetails: Optional[BirthDetails] = Field(None, description="Auto-extracted birth details from the user's message")
