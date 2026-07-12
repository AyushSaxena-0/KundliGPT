from typing import Optional
from pydantic import BaseModel, Field, field_validator
import uuid

class FeedbackRequest(BaseModel):
    """
    Request schema for submitting user feedback.
    """
    rating: int = Field(..., description="Rating score from 1 to 5", example=5)
    comment: Optional[str] = Field(None, description="Optional text comment from the user", example="Great reading, very insightful!")
    conversationId: str = Field(..., description="UUID of the conversation session being rated", example="d3b07384-d113-4956-a5db-e8c14c5b6b1a")

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, value: int) -> int:
        if value < 1 or value > 5:
            raise ValueError("Rating must be an integer between 1 and 5 inclusive.")
        return value

    @field_validator("comment")
    @classmethod
    def validate_comment(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped = value.strip()
        if len(stripped) > 1000:
            raise ValueError("Comment is too long. Max 1000 characters.")
        return stripped

    @field_validator("conversationId")
    @classmethod
    def validate_conversation_id(cls, value: str) -> str:
        stripped = value.strip()
        try:
            uuid.UUID(stripped)
        except ValueError:
            raise ValueError("conversationId must be a valid UUID.")
        return stripped

class FeedbackResponse(BaseModel):
    """
    Standard response schema for successful feedback submission.
    """
    status: str = Field("success", description="Status of the operation")
    message: str = Field("Feedback submitted successfully", description="Informative message")
