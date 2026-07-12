import pytest
import asyncio
from app.schemas.response import ApiResponseEnvelope, ErrorItem
from app.services.cache.memory import MemoryCache
from app.services.tasks.local import local_scheduler
from app.services.observability import observability_service
from app.utils.i18n import i18n_translator

@pytest.mark.asyncio
async def test_memory_cache_ttl_and_ops():
    """
    Verify MemoryCache operations and deletions.
    """
    cache = MemoryCache()
    await cache.set("test_key", "hello_world", 5)
    val = await cache.get("test_key")
    assert val == "hello_world"
    
    await cache.delete("test_key")
    val_del = await cache.get("test_key")
    assert val_del is None

@pytest.mark.asyncio
async def test_task_scheduler_enqueues():
    """
    Verify LocalTaskScheduler routes tasks and executes async handlers.
    """
    triggered = False
    
    async def handler_test(payload):
        nonlocal triggered
        triggered = True
        assert payload["value"] == "ping"

    local_scheduler.register_handler("test_job", handler_test)
    task_id = await local_scheduler.enqueue("test_job", {"value": "ping"})
    assert task_id is not None
    
    # Allow async task execution slice
    await asyncio.sleep(0.05)
    assert triggered is True

@pytest.mark.asyncio
async def test_observability_health():
    """
    Verify diagnostics endpoint healthcheck compiles correctly.
    """
    health = await observability_service.get_health_status()
    assert health["status"] in ["healthy", "unhealthy"]
    assert "version" in health
    assert "services" in health

def test_translation_languages():
    """
    Verify English and Hindi translation fallbacks.
    """
    en_val = i18n_translator.get_text("greeting", "en")
    hi_val = i18n_translator.get_text("greeting", "hi")
    assert "Namaste" in en_val
    assert "नमस्ते" in hi_val

def test_response_envelope_validation():
    """
    Verify standard JSON structure compliance.
    """
    envelope = ApiResponseEnvelope(
        success=True,
        data={"records": [100]},
        meta={"limit": 10},
        errors=[]
    )
    assert envelope.success is True
    assert envelope.data["records"] == [100]
