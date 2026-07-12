import os
import json
import logging
from typing import Dict, Any

logger = logging.getLogger("app.services.ai.prompt_manager")

class PromptManager:
    """
    Manages versioned, externalized prompt templates to prevent hardcoded prompts.
    """
    def __init__(self):
        self.prompts_file = os.path.join(os.path.dirname(__file__), "prompts.json")
        self.prompts: Dict[str, Any] = {}
        self.load_prompts()

    def load_prompts(self):
        try:
            if os.path.exists(self.prompts_file):
                with open(self.prompts_file, "r", encoding="utf-8") as f:
                    self.prompts = json.load(f)
                logger.info("Successfully loaded versioned prompts from prompts.json.")
            else:
                logger.warning(f"Prompts file not found at {self.prompts_file}. Initializing defaults.")
                self.prompts = {}
        except Exception as e:
            logger.error(f"Failed to parse prompts file: {e}")
            self.prompts = {}

    def get_prompt(self, category: str, fallback: str = "") -> str:
        """
        Retrieves the prompt template string for the specified category.
        """
        return self.prompts.get(category, {}).get("template", fallback)

    def get_version(self, category: str) -> str:
        """
        Retrieves the template version for tracking and audit.
        """
        return self.prompts.get(category, {}).get("version", "0.0.0")

# Singleton prompt manager
prompt_manager = PromptManager()
