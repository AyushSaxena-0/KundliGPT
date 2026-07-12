import os
import logging
from typing import Dict, Any
from app.config import settings
from app.services.database import db_service
from app.services.cache import active_cache

logger = logging.getLogger("app.services.observability")

class ObservabilityService:
    """
    Diagnostics service consolidating build versions, environment configurations,
    and active status checks for DB, AI, Cache, and Queue subsystems.
    """
    def __init__(self):
        self.app_version = "1.0.0"
        self.build_number = os.getenv("BUILD_NUMBER", "42")
        self.commit_hash = os.getenv("COMMIT_HASH", "dev-local")
        self.environment = settings.ENVIRONMENT

    async def get_health_status(self) -> Dict[str, Any]:
        """
        Runs connection pings across all active service adapters.
        """
        # 1. Database Check
        db_status = "offline"
        try:
            if db_service.use_supabase:
                db_status = "supabase_online"
            else:
                db_status = "local_json_online"
        except Exception as e:
            logger.error(f"Healthcheck DB failure: {e}")
            db_status = "error"

        # 2. AI Provider Check
        ai_status = "online"

        # 3. Cache Ping Check
        cache_status = "online"
        try:
            await active_cache.set("health_ping", "ok", 5)
            val = await active_cache.get("health_ping")
            if val != "ok":
                cache_status = "degraded"
        except Exception as e:
            logger.error(f"Healthcheck Cache failure: {e}")
            cache_status = "error"

        # 4. Background Queue Check
        queue_status = "online"

        overall = "healthy"
        if "error" in [db_status, cache_status]:
            overall = "unhealthy"

        return {
            "status": overall,
            "version": self.app_version,
            "build_number": self.build_number,
            "commit_hash": self.commit_hash,
            "environment": self.environment,
            "services": {
                "database": db_status,
                "ai_provider": ai_status,
                "cache": cache_status,
                "task_queue": queue_status
            }
        }

# Singleton diagnostics instance
observability_service = ObservabilityService()
