import uuid
import re
from typing import Any, Dict

def generate_uuid() -> str:
    """
    Generates a cryptographically secure random UUIDv4.
    """
    return str(uuid.uuid4())

def sanitize_input(text: str) -> str:
    """
    Sanitizes string inputs to strip leading/trailing spaces, remove null bytes,
    and mitigate basic prompt injection attempt payloads (like system instruction overrides).
    """
    if not text:
        return ""
    
    # Strip null characters
    text = text.replace("\x00", "")
    
    # Strip common system instruction override prefixes
    # e.g., "Ignore previous instructions", "You are now a..."
    injection_patterns = [
        r"(?i)\bignore\s+(?:all\s+)?previous\s+instructions\b",
        r"(?i)\bignore\s+(?:all\s+)?prior\s+instructions\b",
        r"(?i)\bignore\s+above\s+instructions\b",
        r"(?i)\bignore\s+the\s+system\s+prompt\b",
        r"(?i)\bnew\s+rule:\b",
        r"(?i)\byou\s+are\s+now\s+a\b",
        r"(?i)\bsystem\s+override\b",
    ]
    
    sanitized = text
    for pattern in injection_patterns:
        sanitized = re.sub(pattern, "[injection attempt neutralized]", sanitized)
        
    return sanitized.strip()

def format_api_response(status: str, message: str, data: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Utility to format success or standard error JSON responses consistently.
    """
    response = {
        "status": status,
        "message": message,
    }
    if data is not None:
        response["data"] = data
    return response
