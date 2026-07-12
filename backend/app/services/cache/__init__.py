import os
from app.services.cache.base import CacheProvider
from app.services.cache.memory import MemoryCache
from app.services.cache.redis import RedisCache

def get_cache_provider() -> CacheProvider:
    """
    Factory loading the appropriate CacheProvider based on environment.
    """
    provider = os.getenv("CACHE_PROVIDER", "memory").lower()
    if provider == "redis":
        host = os.getenv("REDIS_HOST", "localhost")
        port = int(os.getenv("REDIS_PORT", "6379"))
        password = os.getenv("REDIS_PASSWORD", None)
        return RedisCache(host=host, port=port, password=password)
    return MemoryCache()

# Active default cache singleton
active_cache = get_cache_provider()
