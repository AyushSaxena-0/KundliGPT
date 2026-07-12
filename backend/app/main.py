import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.config import settings
from app.routes import api_router
from app.middleware import TimingMiddleware, RequestIdMiddleware, ExceptionHandlerMiddleware

# 1. Setup Structured Logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s (ReqID: %(request_id)s) - %(message)s",
)

# Custom Filter to inject Request ID dynamically into logs if present
class RequestIdLogFilter(logging.Filter):
    def filter(self, record):
        # Default request_id to N/A
        record.request_id = "N/A"
        # Try to extract request_id from current request context or state
        # In multi-threaded context, we could use ContextVar. 
        # For simplicity, we can fetch it dynamically or let the log statements supply it.
        # Alternatively, we keep the request ID directly in route logs.
        # To avoid complex context-local tracking, we can keep the default formatting clean.
        return True

# Update format to standard logger if ContextVars is not configured, or log explicitly.
# Let's simplify the logging format to be clean and standard:
logging.getLogger().handlers[0].setFormatter(
    logging.Formatter("%(asctime)s [%(levelname)s] %(name)s - %(message)s")
)

logger = logging.getLogger("app.main")

# 2. Initialize FastAPI Application
app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for AI Vedic Astrologer chatbot utilizing Gemini LLM API.",
    version="1.0.0",
    debug=settings.DEBUG,
    docs_url="/docs",
    redoc_url="/redoc",
)

# 3. Mount Custom Middlewares (Ordered by Execution: Outer to Inner)

# Catch-all Exception Middleware (Traps unhandled exceptions and outputs JSON)
app.add_middleware(ExceptionHandlerMiddleware)

# CORS Middleware (Configures Allowed Origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compression Middleware (Compresses large response payloads)
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Performance/Latency Timing Middleware
app.add_middleware(TimingMiddleware)

# Request ID Middleware (Tracks and correlates logs)
app.add_middleware(RequestIdMiddleware)

# Custom Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    # STS Header (Only enabled if https, safe to include for production compliance)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# 4. Mount API Routes
app.include_router(api_router)

# 5. Global Exception Handler for Pydantic Validation Errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Overrides the default FastAPI HTTP 422 Unprocessable Entity for Pydantic validations,
    returning a clean HTTP 400 Bad Request with precise validation details.
    """
    request_id = getattr(request.state, "request_id", "unknown")
    logger.warning(
        f"Validation failure for request: {request.method} {request.url.path} "
        f"| Request ID: {request_id} | Errors: {exc.errors()}"
    )

    formatted_errors = []
    for err in exc.errors():
        # Clean location list to present readable path
        loc_path = " -> ".join([str(l) for l in err.get("loc", []) if l != "body"])
        msg = err.get("msg", "Validation error")
        formatted_errors.append({
            "field": loc_path or "payload",
            "message": msg
        })

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": "Request validation failed. Please check the provided values.",
            "errors": formatted_errors,
            "type": "ValidationError",
            "requestId": request_id
        }
    )

@app.on_event("startup")
async def startup_event():
    logger.info("*" * 50)
    logger.info(f"Starting {settings.APP_NAME}...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug Mode: {settings.DEBUG}")
    logger.info(f"Allowed Origins: {settings.ALLOWED_ORIGINS}")
    logger.info("*" * 50)
