import logging
from typing import Dict

logger = logging.getLogger("app.utils.i18n")

class TranslationService:
    """
    Localization engine translating core server-side messages.
    Supports English ("en") and Hindi ("hi") default keys.
    """
    def __init__(self):
        # Translatables library dictionary
        self.translations: Dict[str, Dict[str, str]] = {
            "en": {
                "greeting": "Namaste 🙏 Welcome to AI Vedic Astrologer.",
                "disclaimer": "Astrology offers interpretations of planetary energies rather than absolute physical certainties. Your free will and personal actions (Karma) remain the ultimate driving forces in shaping your life path.",
                "error_db": "Database connection offline. Booting in local storage fallback.",
                "error_ai": "AI chart calculation failed. Please verify birth details coordinates."
            },
            "hi": {
                "greeting": "नमस्ते 🙏 एआई वैदिक ज्योतिषी में आपका स्वागत है।",
                "disclaimer": "ज्योतिष भविष्यवाणियों के बजाय व्याख्याएं प्रदान करता है। आपकी इच्छाशक्ति और कर्म (कर्म) आपके जीवन को आकार देते हैं।",
                "error_db": "डेटाबेस कनेक्शन ऑफ़लाइन है। स्थानीय भंडारण में बूट किया जा रहा है।",
                "error_ai": "एआई ज्योतिष गणना विफल रही। कृपया जन्म विवरणों को सत्यापित करें।"
            }
        }

    def get_text(self, key: str, lang: str = "en") -> str:
        """
        Translates text keys. Default fallback is English.
        """
        target_lang = (lang or "en").lower()[:2]
        if target_lang not in self.translations:
            target_lang = "en"
        return self.translations[target_lang].get(key, key)

# Singleton i18n translator
i18n_translator = TranslationService()
