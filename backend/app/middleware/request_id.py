import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class RequestIdMiddleware(BaseHTTPMiddleware):
    """
    Middleware that generates or propagates a unique 'X-Request-ID' header
    for tracing and structured logging.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        # Check if request has a request ID header
        request_id = request.headers.get("X-Request-ID")
        if not request_id:
            # Generate a new unique ID
            request_id = str(uuid.uuid4())
        
        # Attach the request ID to the request state for route access
        request.state.request_id = request_id
        
        response = await call_next(request)
        
        # Add the request ID to response headers
        response.headers["X-Request-ID"] = request_id
        return response
