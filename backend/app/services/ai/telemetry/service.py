import logging
from typing import Dict, Any

logger = logging.getLogger("app.services.ai.telemetry")

class TelemetryService:
    """
    Telemetry service to track model performance, response sizing, latencies, and error states.
    Does not log private conversation logs to maintain confidentiality.
    """
    def log_call(
        self,
        model_name: str,
        latency_seconds: float,
        prompt_chars: int,
        response_chars: int,
        retry_count: int = 0,
        error: str = None
    ):
        """
        Records a structured telemetry line into logging gateways.
        """
        metrics = {
            "model": model_name,
            "latency_ms": int(latency_seconds * 1000),
            "prompt_size_chars": prompt_chars,
            "response_size_chars": response_chars,
            "retries": retry_count,
            "success": error is None,
            "error_message": error or ""
        }
        logger.info(f"[Telemetry Metrics Log] {metrics}")

# Singleton instance
telemetry_service = TelemetryService()
