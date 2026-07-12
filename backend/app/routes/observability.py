import logging
from fastapi import APIRouter, status
from app.services.observability import observability_service
from app.schemas.response import ApiResponseEnvelope

logger = logging.getLogger("app.routes.observability")
observability_router = APIRouter(prefix="/api/observability")

@observability_router.get(
    "/health",
    status_code=status.HTTP_200_OK,
    summary="Fetch application health and diagnostics metrics"
)
async def get_health():
    """
    Returns operational metrics of connected databases, AI providers, and cache nodes.
    """
    metrics = await observability_service.get_health_status()
    success = metrics["status"] == "healthy"
    
    return ApiResponseEnvelope(
        success=success,
        data=metrics,
        meta={"version": metrics["version"]},
        errors=[]
    )
