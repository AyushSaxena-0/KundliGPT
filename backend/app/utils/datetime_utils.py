from datetime import datetime, UTC
import zoneinfo

def get_utc_now() -> datetime:
    """
    Returns the current datetime in UTC timezone.
    """
    return datetime.now(UTC)

def get_formatted_utc_now() -> str:
    """
    Returns current UTC timestamp formatted as ISO-8601 string.
    """
    return get_utc_now().isoformat().replace("+00:00", "Z")

def parse_iso_datetime(dt_str: str) -> datetime:
    """
    Parses an ISO-8601 formatted datetime string back into a timezone-aware datetime object.
    Supports Z suffix and standard offsets.
    """
    if dt_str.endswith("Z"):
        dt_str = dt_str[:-1] + "+00:00"
    return datetime.fromisoformat(dt_str)

def get_local_time(timezone_str: str) -> datetime:
    """
    Returns current time in specified timezone (e.g. 'Asia/Kolkata').
    Falls back to UTC if timezone is invalid or not found.
    """
    try:
        tz = zoneinfo.ZoneInfo(timezone_str)
        return datetime.now(tz)
    except Exception:
        return get_utc_now()
