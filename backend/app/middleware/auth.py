from fastapi import Request, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.config.config import settings
from app.services.database import db_service
import httpx
import logging
from typing import Optional

logger = logging.getLogger("app.middleware.auth")
security = HTTPBearer(auto_error=False)

class AuthenticatedUser:
    """Representing an authenticated session details."""
    def __init__(self, id: str, email: str, is_admin: bool = False):
        self.id = id
        self.email = email
        self.is_admin = is_admin

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> AuthenticatedUser:
    """
    FastAPI Dependency to authenticate JWT tokens from client request headers.
    Connects to Supabase Auth server, falls back to mock user in local dev environment.
    """
    # 1. Local development bypass if Supabase is unconfigured
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        logger.debug("Bypassing JWT check: running in local offline mock auth environment.")
        return AuthenticatedUser(
            id="usr-mock-12345",
            email="mockuser@example.com",
            is_admin=True # Grant admin privileges locally for testing simplicity
        )

    # 2. Check authorization header presence
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is missing. Please log in."
        )

    token = credentials.credentials

    # 3. Call Supabase Auth endpoint to check token validity
    url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user"
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {token}"
    }

    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=headers)
            if res.status_code != 200:
                logger.warning(f"JWT verification failed on Supabase: {res.text}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid or expired session token."
                )
            
            user_data = res.json()
            user_id = user_data["id"]
            email = user_data["email"]

            # 4. Fetch profile from database to determine role (e.g. admin)
            profile = await db_service.get_profile(user_id)
            is_admin = False
            if profile:
                is_admin = profile.get("is_admin", False)
            else:
                # Lazy create database profile if it doesn't exist
                name = user_data.get("user_metadata", {}).get("full_name", email.split("@")[0])
                new_profile = await db_service.create_profile(user_id, name, email)
                is_admin = new_profile.get("is_admin", False)

            return AuthenticatedUser(id=user_id, email=email, is_admin=is_admin)

    except httpx.RequestError as e:
        logger.error(f"HTTP connection to Supabase Auth failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Authentication service temporarily unavailable."
        )

async def get_optional_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Optional[AuthenticatedUser]:
    """
    Optional authorization dependency.
    Bypasses authentication for guest sessions while resolving user profiles if token is present.
    """
    if not credentials:
        return None
    try:
        return await get_current_user(request, credentials)
    except Exception:
        return None

async def get_admin_user(
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> AuthenticatedUser:
    """Dependency restricting routes to admin users only."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Administrator privileges required."
        )
    return current_user
