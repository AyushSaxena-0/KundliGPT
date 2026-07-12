import os
from app.services.tasks.base import TaskScheduler
from app.services.tasks.local import local_scheduler

def get_scheduler() -> TaskScheduler:
    """
    Factory loading the TaskScheduler provider.
    Defaults to asyncio-based local worker.
    """
    provider = os.getenv("TASK_QUEUE_PROVIDER", "local").lower()
    # Placeholder for future Celery or RQ provider loadings
    return local_scheduler

# Active default task scheduler singleton
active_scheduler = get_scheduler()
