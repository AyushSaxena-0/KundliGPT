import logging
from typing import List
from app.schemas.chat import ChatHistoryItem
from app.services.ai.providers import ai_provider
from app.services.ai.prompt_manager import prompt_manager

logger = logging.getLogger("app.services.ai.summarizer")

class SummarizerService:
    """
    Summarization service to compress long histories and preserve key conversational context.
    """
    async def summarize_history(self, history: List[ChatHistoryItem]) -> str:
        if not history:
            return ""

        history_text = "\n".join([f"{item.role}: {item.content}" for item in history])
        template = prompt_manager.get_prompt("summarization")
        prompt = template.format(history_text=history_text)

        try:
            summary = await ai_provider.generate(
                prompt=prompt,
                config_override={"temperature": 0.2, "max_tokens": 150}
            )
            logger.info("Successfully summarized conversation history.")
            return summary.strip()
        except Exception as e:
            logger.error(f"Summarization failure: {e}")
            return "A discussion regarding Vedic astrological readings and birth chart placements."

# Singleton instance
summarizer_service = SummarizerService()
