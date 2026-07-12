import os
from typing import List, Optional
import logging
from app.schemas.astrology import BirthDetails
from app.schemas.chat import ChatHistoryItem

logger = logging.getLogger("app.services.prompt_builder")

class PromptBuilder:
    """
    Service responsible for loading prompts and composing the contextual Gemini prompt.
    Keeps prompt construction logic isolated from the HTTP routes.
    """
    def __init__(self):
        self.system_prompt = self._load_system_prompt()

    def _load_system_prompt(self) -> str:
        """
        Dynamically loads the system prompt from the prompts directory.
        Checks multiple possible paths for robustness in local/production environments.
        """
        # Determine path relative to this service file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        possible_paths = [
            os.path.join(current_dir, "..", "prompts", "system_prompt.txt"),
            os.path.join(os.getcwd(), "backend", "app", "prompts", "system_prompt.txt"),
            os.path.join(os.getcwd(), "app", "prompts", "system_prompt.txt"),
            os.path.join(os.getcwd(), "prompts", "system_prompt.txt"),
        ]

        for path in possible_paths:
            if os.path.exists(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read().strip()
                        logger.info(f"Successfully loaded system prompt from {path}")
                        return content
                except Exception as e:
                    logger.error(f"Error reading system prompt from {path}: {e}")

        # Fallback system prompt if file not found (though file should exist as per spec)
        logger.warning("System prompt file not found. Utilizing default fallback prompt.")
        return (
            "You are a wise and compassionate Vedic Astrologer. Give practical and interpretative guidance. "
            "Never guarantee predictions, avoid superstition, and never offer legal, medical, or financial advice."
        )

    def build_system_instruction(self) -> str:
        """
        Returns the raw system instruction to configure the Gemini model.
        """
        return self.system_prompt

    def build_user_prompt(
        self, 
        message: str, 
        birth_details: Optional[BirthDetails], 
        history: List[ChatHistoryItem]
    ) -> str:
        """
        Injects birth details, chat history, and the latest user message to form a single
        well-structured prompt payload for Gemini.
        """
        prompt_parts = []

        # 1. Inject Birth Details
        prompt_parts.append("### USER BIRTH DETAILS")
        if birth_details:
            details_provided = False
            for field, val in birth_details.model_dump().items():
                if val is not None:
                    details_provided = True
                    friendly_name = field.replace("_", " ").title()
                    prompt_parts.append(f"- {friendly_name}: {val}")
            
            if not details_provided:
                prompt_parts.append("No birth details have been provided yet.")
        else:
            prompt_parts.append("No birth details have been provided yet.")
        
        prompt_parts.append("\n" + "="*40 + "\n")

        # 2. Inject Chat History
        prompt_parts.append("### CONVERSATION HISTORY")
        if history:
            for item in history:
                # Standardize roles
                role_label = "User" if item.role == "user" else "Astrologer"
                prompt_parts.append(f"{role_label}: {item.content}")
        else:
            prompt_parts.append("No previous history in this conversation.")
            
        prompt_parts.append("\n" + "="*40 + "\n")

        # 3. Inject New Message
        prompt_parts.append("### CURRENT USER MESSAGE")
        prompt_parts.append(f"User: {message}")
        prompt_parts.append("\nAstrologer:")

        return "\n".join(prompt_parts)

# Singleton instance
prompt_builder = PromptBuilder()
