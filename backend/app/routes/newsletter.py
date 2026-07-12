import logging
import re
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator
from app.services.newsletter import newsletter_service

logger = logging.getLogger("app.routes.newsletter")
newsletter_router = APIRouter(prefix="/api/newsletter")

class SubscriptionRequest(BaseModel):
    email: str = Field(..., description="User email address")
    name: str = Field(None, description="Optional subscriber name")

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        stripped = value.strip()
        email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
        if not re.match(email_regex, stripped):
            raise ValueError("Invalid email format.")
        return stripped

@newsletter_router.post(
    "/subscribe",
    status_code=status.HTTP_200_OK,
    summary="Subscribe to the daily astrology newsletter"
)
async def subscribe_newsletter(request: SubscriptionRequest):
    """
    Registers user email into newsletter mailing list using replaceable providers.
    """
    logger.info(f"Mailing list subscription request received for: {request.email}")
    try:
        success = await newsletter_service.subscribe(request.email, request.name)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to register subscription. Please try again later."
            )
        return {
            "status": "success",
            "message": "Subscription request received. Please check your inbox for verification."
        }
    except Exception as e:
        logger.error(f"Newsletter subscription exception occurred: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Mailing list register failed: {str(e)}"
        )
