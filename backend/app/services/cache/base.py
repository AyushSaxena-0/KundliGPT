from abc import ABC, abstractmethod
from typing import Any, Optional

class CacheProvider(ABC):
    """
    Abstract interface for swappable cache engines (in-memory dict, Redis, or Cloud cache).
    """
    @abstractmethod
    async def get(self, key: str) -> Optional[Any]:
        """
        Retrieves a cached value by key.
        """
        pass

    @abstractmethod
    async def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> bool:
        """
        Sets a value in the cache with an optional expiration time in seconds.
        """
        pass

    @abstractmethod
    async def delete(self, key: str) -> bool:
        """
        Removes an entry from the cache.
        """
        pass

    @abstractmethod
    async def clear(self) -> bool:
        """
        Flushes the entire cache namespace.
        """
        pass
