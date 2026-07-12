import logging
from typing import Any, Optional
from app.services.cache.base import CacheProvider
from app.services.cache.memory import MemoryCache

logger = logging.getLogger("app.services.cache.redis")

class RedisCache(CacheProvider):
    """
    Redis cache implementation.
    Falls back gracefully to MemoryCache if connection fails or package is missing.
    """
    def __init__(self, host: str = "localhost", port: int = 6379, password: str = None):
        self.fallback = MemoryCache()
        self.client = None
        try:
            import redis
            self.client = redis.Redis(
                host=host, 
                port=port, 
                password=password, 
                socket_timeout=2.0
            )
            self.client.ping()
            logger.info(f"Redis cache initialized and connected at {host}:{port}")
        except Exception as e:
            logger.warning(f"Redis client initialization skipped ({e}). Falling back to memory cache.")
            self.client = None

    async def get(self, key: str) -> Optional[Any]:
        if not self.client:
            return await self.fallback.get(key)
        try:
            import pickle
            val = self.client.get(key)
            return pickle.loads(val) if val else None
        except Exception as e:
            logger.error(f"Redis GET failed: {e}. Executing fallback.")
            return await self.fallback.get(key)

    async def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> bool:
        if not self.client:
            return await self.fallback.set(key, value, ttl_seconds)
        try:
            import pickle
            serialized = pickle.dumps(value)
            self.client.setex(key, ttl_seconds, serialized)
            return True
        except Exception as e:
            logger.error(f"Redis SET failed: {e}. Executing fallback.")
            return await self.fallback.set(key, value, ttl_seconds)

    async def delete(self, key: str) -> bool:
        if not self.client:
            return await self.fallback.delete(key)
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            logger.error(f"Redis DELETE failed: {e}. Executing fallback.")
            return await self.fallback.delete(key)

    async def clear(self) -> bool:
        if not self.client:
            return await self.fallback.clear()
        try:
            self.client.flushdb()
            return True
        except Exception as e:
            logger.error(f"Redis FLUSH failed: {e}. Executing fallback.")
            return await self.fallback.clear()
        
    def __del__(self):
        # Clean shutdown check
        if self.client:
            try:
                self.client.close()
            except Exception:
                pass
