import logging
from typing import List, Dict, Any, Optional
from app.schemas.chat import ChatHistoryItem
from app.schemas.astrology import BirthDetails
from app.services.ai.summarizer.service import summarizer_service

logger = logging.getLogger("app.services.ai.memory")

class ConversationMemory:
    """
    Manages short-term conversation sliding windows, long-term summaries,
    birth details, and recent topics.
    """
    def __init__(self, history: List[ChatHistoryItem], birth_details: Optional[BirthDetails] = None):
        self.history = history
        self.birth_details = birth_details
        self.long_term_summary = ""
        self.recent_topics: List[str] = []

    async def initialize(self):
        """
        Compresses older logs into a summary and extracts active topics.
        """
        # 1. Automatic compression of long logs
        if len(self.history) > 10:
            history_to_summarize = self.history[:-6]
            if len(history_to_summarize) > 10:
                history_to_summarize = history_to_summarize[-10:]
            self.long_term_summary = await summarizer_service.summarize_history(history_to_summarize)
            
        # 2. Extract recent topics via scan
        self.recent_topics = self._extract_recent_topics()

    def get_recent_history(self, limit: int = 6) -> List[ChatHistoryItem]:
        """
        Fetches the immediate short-term chat window messages.
        """
        return self.history[-limit:] if self.history else []

    def _extract_recent_topics(self) -> List[str]:
        """
        Identifies active astrological subjects from the last few messages.
        """
        subjects = ["career", "marriage", "wealth", "finance", "sade sati", "dasha", "transit", "remedy"]
        found = []
        recent_messages = self.history[-4:] if self.history else []
        for msg in recent_messages:
            content_lower = msg.content.lower()
            for sub in subjects:
                if sub in content_lower and sub not in found:
                    found.append(sub)
        return found
