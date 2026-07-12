from typing import List, Dict, Any, Optional
from app.repositories.base import UserRepository, BirthDetailsRepository, ConversationRepository
from app.services.database import db_service

class UserRepositoryImpl(UserRepository):
    """
    Profile data manager utilizing database services.
    """
    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        return await db_service.get_profile(user_id)

    async def update_profile(self, user_id: str, name: str) -> Optional[Dict[str, Any]]:
        return await db_service.update_profile(user_id, name)

    async def delete_profile(self, user_id: str) -> bool:
        return await db_service.delete_account(user_id)

class BirthDetailsRepositoryImpl(BirthDetailsRepository):
    """
    Birth details coordinator utilizing database services.
    """
    async def get_details(self, user_id: str) -> List[Dict[str, Any]]:
        return await db_service.get_saved_birth_details(user_id)

    async def save_details(self, user_id: str, details: Dict[str, Any]) -> Dict[str, Any]:
        return await db_service.save_birth_details(user_id, details)

    async def delete_details(self, user_id: str, record_id: str) -> bool:
        return await db_service.delete_birth_details(record_id, user_id)

class ConversationRepositoryImpl(ConversationRepository):
    """
    Consultation log tracker utilizing database services.
    """
    async def get_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        return await db_service.get_conversations(user_id)

    async def create_conversation(self, user_id: str, title: str) -> Dict[str, Any]:
        return await db_service.create_conversation(user_id, title)

    async def save_message(self, conversation_id: str, role: str, content: str) -> Dict[str, Any]:
        return await db_service.save_message(conversation_id, role, content)

    async def get_messages(self, conversation_id: str) -> List[Dict[str, Any]]:
        return await db_service.get_messages(conversation_id)

    async def delete_conversation(self, user_id: str, conversation_id: str) -> bool:
        return await db_service.delete_conversation(conversation_id, user_id)
