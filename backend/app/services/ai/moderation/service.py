import re
import logging
from typing import Tuple

logger = logging.getLogger("app.services.ai.moderation")

class ModerationService:
    """
    Moderation layer checks user messages for injection attacks, abusive terms, spam, or unsafe requests.
    """
    def __init__(self):
        # Compiled patterns for rapid matching
        self.injection_patterns = [
            re.compile(r"ignore\s+previous\s+instructions", re.IGNORECASE),
            re.compile(r"override\s+system\s+prompt", re.IGNORECASE),
            re.compile(r"reveal\s+your\s+instructions", re.IGNORECASE),
            re.compile(r"dan\s+mode", re.IGNORECASE),
            re.compile(r"developer\s+mode\s+enabled", re.IGNORECASE)
        ]
        
        self.abusive_patterns = [
            re.compile(r"\b(fuck|shit|asshole|bitch|bastard|idiot)\b", re.IGNORECASE)
        ]

    def audit_input(self, text: str) -> Tuple[bool, str]:
        """
        Audits user message.
        Returns:
            (is_safe, reason_if_unsafe)
        """
        cleaned = text.strip()
        if not cleaned:
            return False, "Input message cannot be empty."

        # 1. Spam detection
        if len(cleaned) > 20 and len(set(cleaned)) < 5:
            logger.warning("Spam pattern detected (too few unique characters).")
            return False, "Repeated character sequences identified as spam."

        # 2. Check for Prompt Injection
        for pattern in self.injection_patterns:
            if pattern.search(cleaned):
                logger.warning(f"Prompt injection pattern match: '{pattern.pattern}'")
                return False, "System directive override attempt detected."

        # 3. Check for Abusive language
        for pattern in self.abusive_patterns:
            if pattern.search(cleaned):
                logger.warning("Abusive content matched.")
                return False, "Message contains inappropriate or abusive language."

        return True, ""

# Singleton instance
moderation_service = ModerationService()
