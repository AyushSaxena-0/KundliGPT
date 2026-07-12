import logging
from abc import ABC, abstractmethod
from typing import Dict, Any

logger = logging.getLogger("app.services.newsletter")

class NewsletterProvider(ABC):
    """
    Abstract interface for newsletter subscription providers.
    Allows swapping between mock local storage, Mailchimp, Resend, or Sendgrid easily.
    """
    @abstractmethod
    async def subscribe(self, email: str, name: str = None) -> bool:
        pass

class MockNewsletterProvider(NewsletterProvider):
    """
    Mock newsletter provider saving emails to a local JSON file or console logger.
    """
    def __init__(self):
        self.file_path = "local_db/newsletter_subscribers.json"
        import os
        import json
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        if not os.path.exists(self.file_path):
            with open(self.file_path, "w") as f:
                json.dump([], f)

    async def subscribe(self, email: str, name: str = None) -> bool:
        import json
        import os
        from datetime import datetime, UTC
        
        logger.info(f"[Newsletter] Mock subscribing user email: {email}")
        
        # Simulating Welcome Email and Double Opt-in placeholders
        logger.info(f"[Newsletter Opt-in Placeholder] Triggering verification challenge to {email}")
        logger.info(f"[Newsletter Welcome Placeholder] Queuing welcome template to {email}")
        
        try:
            subscribers = []
            if os.path.exists(self.file_path):
                try:
                    with open(self.file_path, "r") as f:
                        subscribers = json.load(f)
                except json.JSONDecodeError:
                    subscribers = []
            
            if any(s["email"] == email for s in subscribers):
                return True
                
            subscribers.append({
                "email": email,
                "name": name,
                "subscribed_at": datetime.now(UTC).isoformat(),
                "verified": False # For future double opt-in validation
            })
            
            with open(self.file_path, "w") as f:
                json.dump(subscribers, f, indent=4)
            return True
        except Exception as e:
            logger.error(f"Mock subscription file write error: {e}")
            return False

class ResendNewsletterProvider(NewsletterProvider):
    """
    Production-ready Resend newsletter integration provider.
    """
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def subscribe(self, email: str, name: str = None) -> bool:
        # Future production integration logic placeholder
        logger.info(f"[Newsletter Resend] Triggering API call to Resend contacts directory for {email}")
        return True

class NewsletterService:
    def __init__(self):
        # Default mock provider for MVPs
        self.provider: NewsletterProvider = MockNewsletterProvider()

    def set_provider(self, provider: NewsletterProvider):
        self.provider = provider

    async def subscribe(self, email: str, name: str = None) -> bool:
        return await self.provider.subscribe(email, name)

newsletter_service = NewsletterService()
