from fastapi import APIRouter
from app.routes.base import base_router
from app.routes.chat import chat_router
from app.routes.feedback import feedback_router
from app.services.astrology import astrology_router
from app.routes.product import product_router
from app.routes.newsletter import newsletter_router
from app.routes.observability import observability_router

# Core router to be mounted onto the FastAPI app
api_router = APIRouter()

# Mount specific routers
api_router.include_router(base_router, tags=["Base"])
api_router.include_router(chat_router, prefix="/api", tags=["Chat"])
api_router.include_router(feedback_router, prefix="/api", tags=["Feedback"])
api_router.include_router(astrology_router, tags=["Astrology Calculation Engine"])
api_router.include_router(product_router, tags=["Product Features"])
api_router.include_router(newsletter_router, tags=["Newsletter"])
api_router.include_router(observability_router, tags=["Observability"])
