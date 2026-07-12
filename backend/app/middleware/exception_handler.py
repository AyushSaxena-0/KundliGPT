import uuid
import logging
from datetime import datetime, UTC
from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.schemas.response import ApiResponseEnvelope, ErrorItem

logger = logging.getLogger("app.middleware.exception_handler")

async def global_exception_handler(request: Request, exc: Exception) -> Response:
    """
    Catches all unhandled exceptions, sanitizes technical traces,
    and returns a structured JSON error response.
    """
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    timestamp = datetime.now(UTC).isoformat()
    
    code = "INTERNAL_SERVER_ERROR"
    message = "An unexpected error occurred. Please contact system support."
    details = str(exc)
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR

    if isinstance(exc, StarletteHTTPException):
        status_code = exc.status_code
        message = exc.detail
        code = f"HTTP_{status_code}"
        
    elif isinstance(exc, RequestValidationError):
        status_code = status.HTTP_400_BAD_REQUEST
        message = "Input validation failed."
        code = "VALIDATION_ERROR"
        details = str(exc.errors())

    # Log exception with Request ID context
    logger.exception(f"[Exception Handler] request_id={request_id} error={exc}")

    # Build response envelope
    error_item = ErrorItem(
        code=code,
        message=message,
        details=details if getattr(request.app, "debug", False) else "Technical details logged under trace ID.",
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
        status_code=status_code,
        content=envelope.model_dump()
    )
