import logging
import traceback
from datetime import datetime, UTC
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from app.config import settings
from app.schemas.response import ApiResponseEnvelope, ErrorItem

logger = logging.getLogger("app.middleware.errors")

class ExceptionHandlerMiddleware(BaseHTTPMiddleware):
    """
    Global exception handling middleware that catches uncaught exceptions,
    logs the event, and returns a unified JSON envelope with formatted ErrorItems.
    """
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            return await call_next(request)
        except Exception as exc:
            request_id = getattr(request.state, "request_id", "unknown")
            timestamp = datetime.now(UTC).isoformat()
            
            # Log the complete stack trace internally
            logger.error(
                f"Unhandled Exception occurred during request to {request.method} {request.url.path} "
                f"| Request ID: {request_id} | Error: {str(exc)}\n"
                f"{traceback.format_exc()}"
            )
            
            # Formulate structured error details
            error_details = "Internal error logs recorded under correlation ID."
            if settings.DEBUG:
                error_details = f"Exception: {str(exc)} | Trace: {traceback.format_exc().splitlines()[-3:]}"

            error_item = ErrorItem(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected internal server error occurred. Please try again later.",
                details=error_details,
                timestamp=timestamp,
                request_id=request_id
            )
            
            envelope = ApiResponseEnvelope(
                success=False,
                data=None,
                meta={"request_id": request_id},
                errors=[error_item]
            )
            
            return JSONResponse(
                status_code=500,
                content=envelope.model_dump()
            )
