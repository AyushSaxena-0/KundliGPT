import json
import logging
from typing import Dict, Any
from app.services.ai.providers import ai_provider
from app.services.ai.prompt_manager import prompt_manager

logger = logging.getLogger("app.services.ai.router")

class AIRouter:
    """
    Intelligent routing layer. Identifies query intent and routes
    requests to specific sub-modules.
    """
    def __init__(self):
        # Local keyword match patterns for zero-latency fallbacks
        self.fallbacks = {
            "career": ["job", "career", "work", "promotion", "business", "profession", "boss", "salary"],
            "marriage": ["marry", "marriage", "wife", "husband", "love", "spouse", "wedding", "relationship"],
            "education": ["study", "exam", "school", "college", "degree", "education", "university"],
            "finance": ["money", "wealth", "debt", "finance", "poor", "rich", "investment", "shares"],
            "health": ["health", "disease", "ill", "sick", "pain", "doctor", "wellness", "cure"],
            "compatibility": ["compat", "match", "align", "guna", "kundli milan"],
            "birth_chart": ["birth chart", "rashi", "lagna", "ascendant", "moon sign", "sun sign"],
            "greeting": ["hello", "hi", "namaste", "hey", "who are you", "greeting"],
            "faq": ["why", "how does", "what is", "parameter", "ayanamsa", "sidereal"]
        }

    async def detect_intent(self, query: str) -> Dict[str, Any]:
        """
        Detects user intent by invoking the LLM with structured JSON output,
        falling back to keyword matchers in case of network outages.
        """
        query_lower = query.lower()
        for intent, keywords in self.fallbacks.items():
            if any(kw in query_lower for kw in keywords):
                return {
                    "intent": intent,
                    "confidence": 0.82,
                    "details": "Rule-based keyword matching."
                }

        template = prompt_manager.get_prompt("intent")
        prompt = template.format(query=query)

        try:
            response = await ai_provider.generate(
                prompt=prompt,
                config_override={"temperature": 0.1, "max_tokens": 100}
            )
            
            # Remove markdown wraps if present
            clean_res = response.strip()
            if clean_res.startswith("```json"):
                clean_res = clean_res[7:]
            if clean_res.endswith("```"):
                clean_res = clean_res[:-3]
            
            data = json.loads(clean_res.strip())
            logger.info(f"LLM successfully routed intent: {data}")
            return data
        except Exception as e:
            logger.warning(f"LLM intent routing failed: {e}. Executing keyword fallback.")
            
            # Rule-based fallback
            for intent, keywords in self.fallbacks.items():
                if any(kw in query_lower for kw in keywords):
                    return {
                        "intent": intent,
                        "confidence": 0.70,
                        "details": "Rule-based keyword matching fallback."
                    }
                    
            return {
                "intent": "general",
                "confidence": 0.50,
                "details": "Default general routing due to unmatched keywords."
            }

# Singleton instance
ai_router = AIRouter()
