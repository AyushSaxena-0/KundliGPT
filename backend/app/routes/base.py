import time
from fastapi import APIRouter
from app.config import settings
from app.utils.datetime_utils import get_formatted_utc_now

base_router = APIRouter()

# Record startup time for uptime calculation
START_TIME = time.time()

@base_router.get("/", summary="Root endpoint returning application metadata")
async def root():
    """
    Returns application details including metadata, version, health status, and current server time.
    """
    return {
        "appName": settings.APP_NAME,
        "version": "1.0.0",
        "status": "online",
        "health": "excellent",
        "timestamp": get_formatted_utc_now()
    }

@base_router.get("/health", summary="Health check endpoint for monitoring")
async def health():
    """
    Detailed health check API returning status, service version, and server uptime.
    """
    uptime_seconds = time.time() - START_TIME
    
    # Format uptime to human-readable string
    days, rem = divmod(int(uptime_seconds), 86400)
    hours, rem = divmod(rem, 3600)
    minutes, seconds = divmod(rem, 60)
    
    uptime_str = ""
    if days > 0:
        uptime_str += f"{days}d "
    if hours > 0 or days > 0:
        uptime_str += f"{hours}h "
    if minutes > 0 or hours > 0 or days > 0:
        uptime_str += f"{minutes}m "
    uptime_str += f"{seconds}s"

    return {
        "status": "healthy",
        "uptime": uptime_str,
        "uptimeSeconds": round(uptime_seconds, 2),
        "version": "1.0.0",
        "timestamp": get_formatted_utc_now()
    }
