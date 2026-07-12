import json
import logging
from typing import List, Dict, Any
from app.services.ai.providers import ai_provider
from app.services.ai.prompt_manager import prompt_manager

logger = logging.getLogger("app.services.ai.recommendation")

class RecommendationService:
    """
    Recommendation Engine recommending relevant astrology calculators, articles, and profiles.
    """
    def __init__(self):
        # Fallback static recommendations by intent
        self.fallbacks = {
            "career": [
                {"title": "Career Astrologer Tool", "url": "/tools/career", "type": "tool"},
                {"title": "Saturn Transit 2026 Blog Post", "url": "/blog/saturn-transit-2026", "type": "article"}
            ],
            "marriage": [
                {"title": "Marriage Compatibility Tool", "url": "/tools/marriage", "type": "tool"},
                {"title": "Kundli Chart Calculator", "url": "/tools/kundli", "type": "tool"}
            ],
            "compatibility": [
                {"title": "Marriage Compatibility Tool", "url": "/tools/marriage", "type": "tool"},
                {"title": "Zodiac Sign Profiles", "url": "/zodiac/aries", "type": "zodiac"}
            ],
            "birth_chart": [
                {"title": "Kundli Chart Calculator", "url": "/tools/kundli", "type": "tool"},
                {"title": "Nakshatra Profile Tool", "url": "/tools/nakshatras", "type": "tool"}
            ],
            "finance": [
                {"title": "Jupiter Transit Career Blog Post", "url": "/blog/jupiter-aspects-d9", "type": "article"},
                {"title": "Career Astrologer Tool", "url": "/tools/career", "type": "tool"}
            ],
            "health": [
                {"title": "Karmic Placements and Remedies Blog", "url": "/blog/rahu-ketu-remedies", "type": "article"},
                {"title": "Nakshatra Profile Tool", "url": "/tools/nakshatras", "type": "tool"}
            ]
        }
        
        self.default_recs = [
            {"title": "Kundli Chart Calculator", "url": "/tools/kundli", "type": "tool"},
            {"title": "Nakshatra Profile Tool", "url": "/tools/nakshatras", "type": "tool"}
        ]

    async def get_recommendations(self, intent: str, recent_topics: str = "") -> List[Dict[str, Any]]:
        """
        Determines contextually relevant recommendations. Falls back to pre-defined rules.
        """
        return self.fallbacks.get(intent.lower(), self.default_recs)

        template = prompt_manager.get_prompt("recommendation")
        prompt = template.format(intent=intent, recent_topics=recent_topics or "General discussion")

        try:
            response = await ai_provider.generate(
                prompt=prompt,
                config_override={"temperature": 0.3, "max_tokens": 150}
            )
            clean_res = response.strip()
            if clean_res.startswith("```json"):
                clean_res = clean_res[7:]
            if clean_res.endswith("```"):
                clean_res = clean_res[:-3]
            
            recs = json.loads(clean_res.strip())
            logger.info("Successfully fetched LLM recommendation objects.")
            return recs
        except Exception as e:
            logger.warning(f"LLM Recommendation failed: {e}. Executing fallback matching.")
            return self.fallbacks.get(intent.lower(), self.default_recs)

# Singleton instance
recommendation_service = RecommendationService()
