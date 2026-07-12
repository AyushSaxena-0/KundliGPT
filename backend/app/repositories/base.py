from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class UserRepository(ABC):
    """
    Interface for user profile data operations.
    """
    @abstractmethod
    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def update_profile(self, user_id: str, name: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    async def delete_profile(self, user_id: str) -> bool:
        pass

class BirthDetailsRepository(ABC):
    """
    Interface for birth chart parameters storage operations.
    """
    @abstractmethod
    async def get_details(self, user_id: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def save_details(self, user_id: str, details: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def delete_details(self, user_id: str, record_id: str) -> bool:
        pass

class ConversationRepository(ABC):
    """
    Interface for chat histories and summarizations storage.
    """
    @abstractmethod
    async def get_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def create_conversation(self, user_id: str, title: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def save_message(self, conversation_id: str, role: str, content: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def delete_conversation(self, user_id: str, conversation_id: str) -> bool:
        pass
