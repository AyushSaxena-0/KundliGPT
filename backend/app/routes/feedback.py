import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.feedback import FeedbackRequest, FeedbackResponse
from app.services.feedback_store import feedback_store
from app.middleware.auth import get_optional_user, AuthenticatedUser
from app.services.database import db_service

logger = logging.getLogger("app.routes.feedback")
feedback_router = APIRouter()

@feedback_router.post(
    "/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit feedback for an astrology reading session",
    description="Saves user ratings and comments linked to a specific conversation ID."
)
async def submit_feedback(request: FeedbackRequest, user: Optional[AuthenticatedUser] = Depends(get_optional_user)):
    """
    Accepts feedback request payload, validates details,
    saves it to JSON storage and database, and returns a successful response.
    """
    logger.info(f"Received feedback submission for Session: {request.conversationId}")
    try:
        # Save to local file store
        await feedback_store.save_feedback(request)
        
        # Save to database service
        await db_service.save_feedback(
            conv_id=request.conversationId,
            rating=request.rating,
            comment=request.comment,
            is_positive=(request.rating >= 4),
            user_id=user.id if user else None
        )
        
        return FeedbackResponse(
            status="success",
            message="Thank you! Your feedback has been stored successfully."
        )
    except Exception as exc:
        logger.error(f"Error persisting feedback for Session {request.conversationId}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not store feedback due to an internal storage issue."
        )
