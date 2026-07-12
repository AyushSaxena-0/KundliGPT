import time
import logging
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

logger = logging.getLogger("app.middleware.timing")

class TimingMiddleware(BaseHTTPMiddleware):
    """
    Middleware that measures the processing time (latency) of each HTTP request
    and attaches an 'X-Response-Time' header to the response.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()
        
        response = await call_next(request)
        
        process_time = time.perf_counter() - start_time
        response.headers["X-Response-Time"] = f"{process_time:.4f}s"
        
        # Log request path, method, and status with timing details
        request_id = request.headers.get("X-Request-ID", "N/A")
        logger.info(
            f"Request: {request.method} {request.url.path} "
            f"| Status: {response.status_code} "
            f"| Latency: {process_time:.4f}s "
            f"| Request ID: {request_id}"
        )
        
        return response
