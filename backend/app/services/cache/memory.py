import time
from typing import Any, Optional, Dict, Tuple
from app.services.cache.base import CacheProvider

class MemoryCache(CacheProvider):
    """
    Thread-safe, lightweight, in-memory dictionary cache with TTL expiration.
    """
    def __init__(self):
        self._store: Dict[str, Tuple[Any, float]] = {}

    async def get(self, key: str) -> Optional[Any]:
        if key not in self._store:
            return None
        value, expiry = self._store[key]
        if time.time() > expiry:
            del self._store[key]
            return None
        return value

    async def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> bool:
        expiry = time.time() + ttl_seconds
        self._store[key] = (value, expiry)
        return True

    async def delete(self, key: str) -> bool:
        if key in self._store:
            del self._store[key]
            return True
        return False

    async def clear(self) -> bool:
        self._store.clear()
        return True
