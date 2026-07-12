import uuid
import asyncio
import logging
from typing import Dict, Any, Callable, Coroutine
from app.services.tasks.base import TaskScheduler

logger = logging.getLogger("app.services.tasks.local")

class LocalTaskScheduler(TaskScheduler):
    """
    Built-in asyncio background worker scheduling jobs concurrently on the active event loop.
    Supports extensible task registrations with zero package requirements.
    """
    def __init__(self):
        self.registry: Dict[str, Callable[[Dict[str, Any]], Coroutine]] = {}
        self._register_default_handlers()

    def register_handler(self, task_name: str, handler: Callable[[Dict[str, Any]], Coroutine]):
        """
        Registers a job worker.
        """
        self.registry[task_name] = handler
        logger.info(f"Registered background worker task handler: '{task_name}'")

    async def enqueue(self, task_name: str, payload: Dict[str, Any], delay_seconds: int = 0) -> str:
        task_id = str(uuid.uuid4())
        asyncio.create_task(self._run_task(task_id, task_name, payload, delay_seconds))
        return task_id

    async def _run_task(self, task_id: str, task_name: str, payload: Dict[str, Any], delay: int):
        if delay > 0:
            await asyncio.sleep(delay)
            
        handler = self.registry.get(task_name)
        if not handler:
            logger.error(f"[Background Task Exception] No handler registered for task '{task_name}' (ID: {task_id})")
            return
            
        try:
            logger.info(f"[Task Started] type={task_name} id={task_id}")
            await handler(payload)
            logger.info(f"[Task Completed] type={task_name} id={task_id}")
        except Exception as e:
            logger.exception(f"[Task Exception] task={task_name} id={task_id} error={e}")

    def _register_default_handlers(self):
        """
        Registers mock placeholders for enterprise tasks.
        """
        async def mock_email(payload: Dict[str, Any]):
            logger.info(f"[Email Worker] Sending welcome/opt-in email to {payload.get('email')}")
            
        async def mock_pdf(payload: Dict[str, Any]):
            logger.info(f"[PDF Worker] Generating printable Astro Report for profile: {payload.get('name')}")

        async def mock_cleanup(payload: Dict[str, Any]):
            logger.info(f"[Cleanup Worker] Wiping database logs older than {payload.get('days', 30)} days.")

        self.register_handler("email_send", mock_email)
        self.register_handler("pdf_generate", mock_pdf)
        self.register_handler("cleanup_jobs", mock_cleanup)

# Singleton scheduler
local_scheduler = LocalTaskScheduler()
