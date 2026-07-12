import os
import json
import logging
from datetime import datetime, UTC
from typing import Optional, List, Dict, Any
from app.schemas.feedback import FeedbackRequest

logger = logging.getLogger("app.services.feedback_store")

class FeedbackStore:
    """
    Service responsible for persisting user feedback.
    Currently uses a JSON file for persistence but designed with an interface
    that can easily be replaced by a database engine in the future.
    """
    def __init__(self, file_path: str = "feedback.json"):
        # Put the feedback file in the working directory or a path configurable
        self.file_path = file_path
        self._init_store()

    def _init_store(self):
        """
        Initializes the JSON file if it does not exist.
        """
        if not os.path.exists(self.file_path):
            try:
                with open(self.file_path, "w", encoding="utf-8") as f:
                    json.dump([], f, indent=4)
                logger.info(f"Initialized feedback storage file at {self.file_path}")
            except Exception as e:
                logger.error(f"Failed to initialize feedback storage file: {e}")

    async def save_feedback(self, request: FeedbackRequest) -> None:
        """
        Saves user feedback to the JSON store.
        This is defined as an async operation to mirror future database saves.
        """
        feedback_data = {
            "conversation_id": request.conversationId,
            "rating": request.rating,
            "comment": request.comment,
            "timestamp": datetime.now(UTC).isoformat()
        }

        # Run file operations in a thread pool to avoid blocking the event loop
        loop = asyncio = None
        try:
            import asyncio
            loop = asyncio.get_running_loop()
        except RuntimeError:
            pass

        if loop and loop.is_running():
            await loop.run_in_executor(None, self._write_to_file, feedback_data)
        else:
            self._write_to_file(feedback_data)

    def _write_to_file(self, data: Dict[str, Any]) -> None:
        """
        Helper method to perform synchronous file write.
        Loads existing feedback, appends new feedback, and writes back.
        """
        # Simple file locking or try/catch for safety
        try:
            feedbacks: List[Dict[str, Any]] = []
            if os.path.exists(self.file_path):
                try:
                    with open(self.file_path, "r", encoding="utf-8") as f:
                        feedbacks = json.load(f)
                except json.JSONDecodeError:
                    logger.warning(f"Feedback file {self.file_path} was corrupted. Re-initializing.")
                    feedbacks = []

            feedbacks.append(data)

            with open(self.file_path, "w", encoding="utf-8") as f:
                json.dump(feedbacks, f, indent=4)
                
            logger.info(f"Feedback saved for conversation {data['conversation_id']}")
        except Exception as e:
            logger.error(f"Failed to write feedback to file: {e}")
            raise RuntimeError("Database storage error. Could not record feedback.") from e

    async def get_all_feedback(self) -> List[Dict[str, Any]]:
        """
        Helper method for testing/admin verification.
        """
        try:
            if os.path.exists(self.file_path):
                with open(self.file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read feedback: {e}")
        return []

# Singleton instance
feedback_store = FeedbackStore()
