from pydantic import BaseModel, Field
from typing import Any, List, Optional, Dict
from datetime import datetime, UTC

class ErrorItem(BaseModel):
    """
    Standardized error details item.
    """
    code: str = Field(..., description="Unique enterprise error code")
    message: str = Field(..., description="Readable user-facing message")
    details: Optional[str] = Field(None, description="Technical context for internal logging")
    timestamp: str = Field(default_factory=lambda: datetime.now(UTC).isoformat())
    request_id: Optional[str] = Field(None, description="Request ID tracking tracer")

class ApiResponseEnvelope(BaseModel):
    """
    Unified JSON API response envelope.
    """
    success: bool = Field(..., description="Indicates call status")
    data: Optional[Any] = Field(None, description="Payload data object")
    meta: Dict[str, Any] = Field(default_factory=dict, description="Pagination, sorting, and telemetry metadata")
    errors: List[ErrorItem] = Field(default_factory=list, description="Array of errors if success is false")
