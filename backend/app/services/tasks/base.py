from abc import ABC, abstractmethod
from typing import Dict, Any

class TaskScheduler(ABC):
    """
    Abstract interface for background task queues.
    Enables queuing actions like emails, chart generation, or aggregates asynchronously.
    """
    @abstractmethod
    async def enqueue(self, task_name: str, payload: Dict[str, Any], delay_seconds: int = 0) -> str:
        """
        Pushes a task into the background execution pool.
        """
        pass
