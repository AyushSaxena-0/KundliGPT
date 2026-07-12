import json
import logging
from typing import List, Dict, Any, Optional, Tuple
from app.schemas.astrology import BirthDetails
from app.schemas.chat import ChatHistoryItem
from app.services.ai.planner.service import ai_planner
from app.services.ai.providers import ai_provider
from app.services.ai.summarizer.service import summarizer_service
from app.utils.helpers import sanitize_input

logger = logging.getLogger("app.services.ai_engine")

class AIEngine:
    """
    AI Orchestration Layer facade. Wraps the new modular AI planning system
    to maintain backward compatibility with existing routes.
    """
    def __init__(self):
        self.planner = ai_planner

    def _extract_birth_details_regex(self, message: str) -> Dict[str, Any]:
        """
        Regex-based rule extractor acting as a high-reliability offline fallback.
        """
        extracted = {}
        msg_lower = message.lower()
        import re

        # 1. Name Matcher
        name_match = re.search(r"(?:my name is|i am|i'm)\s+([a-zA-Z]+)", msg_lower)
        if name_match:
            extracted["name"] = name_match.group(1).capitalize()

        # 2. Date Matcher (e.g. 15 August 2002, 15-08-2002, 2002-08-15)
        iso_match = re.search(r"\b(\d{4})[-/](\d{1,2})[-/](\d{1,2})\b", message)
        if iso_match:
            extracted["date_of_birth"] = f"{iso_match.group(1)}-{int(iso_match.group(2)):02d}-{int(iso_match.group(3)):02d}"
        else:
            months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
            months_full = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
            
            text_date = re.search(r"\b(\d{1,2})\s+([a-zA-Z]{3,12})\s+(\d{4})\b", msg_lower)
            if text_date:
                day = int(text_date.group(1))
                month_str = text_date.group(2)
                year = int(text_date.group(3))
                
                month_idx = -1
                for idx, m in enumerate(months_full):
                    if m in month_str:
                        month_idx = idx + 1
                        break
                if month_idx == -1:
                    for idx, m in enumerate(months):
                        if m in month_str:
                            month_idx = idx + 1
                            break
                            
                if month_idx != -1:
                    extracted["date_of_birth"] = f"{year}-{month_idx:02d}-{day:02d}"

        # 3. Time Matcher (e.g. 6:45 PM, 18:45)
        time_match = re.search(r"\b(\d{1,2}):(\d{2})\s*(am|pm)?\b", msg_lower)
        if time_match:
            hr = int(time_match.group(1))
            mn = int(time_match.group(2))
            meridian = time_match.group(3)
            
            if meridian:
                if meridian == "pm" and hr < 12:
                    hr += 12
                elif meridian == "am" and hr == 12:
                    hr = 0
            extracted["time_of_birth"] = f"{hr:02d}:{mn:02d}"

        # 4. Place Matcher (e.g. born in Moradabad)
        place_match = re.search(r"(?:born in|birth place|place of birth|location)\s+(?:is\s+)?([a-zA-Z\s,]+?)(?:\.|$|at|on|and)", msg_lower)
        if place_match:
            extracted["place_of_birth"] = place_match.group(1).strip().title()

        return extracted

    async def extract_birth_details(self, message: str) -> Optional[Dict[str, Any]]:
        """
        Extracts birth details from message using active provider, falling back to regex.
        """
        regex_details = self._extract_birth_details_regex(message)
        if len(message.strip()) < 8:
            return regex_details if regex_details else None

        extraction_markers = [
            "born", "birth", "dob", "date of birth", "time of birth",
            "place of birth", "my name is", "i am", "i'm"
        ]
        if not any(marker in message.lower() for marker in extraction_markers):
            return regex_details if regex_details else None

        system_instruction = (
            "You are an information extraction assistant. Analyze the user's message "
            "and extract mentioned Vedic birth details. Respond ONLY with a valid JSON object. "
            "Do not write conversational text or markdown code block wrappers."
        )

        user_prompt = f"""
Analyze the user message and extract the following variables if mentioned:
- name (string)
- gender (string)
- date_of_birth (string in YYYY-MM-DD format)
- time_of_birth (string in 24-hour HH:MM format)
- place_of_birth (string)
- timezone (string)

Rules:
1. Set field to null if not mentioned or cannot be inferred.
2. Format times like "6:45 PM" to "18:45".
3. Format dates like "12 June 2002" to "2002-06-12".

User Message: "{message}"

JSON Response:
"""
        try:
            response = await ai_provider.generate(
                prompt=user_prompt,
                system_instruction=system_instruction,
                config_override={"temperature": 0.1, "max_tokens": 150, "retry_count": 1, "timeout": 5}
            )
            
            clean_res = response.strip()
            if clean_res.startswith("```json"):
                clean_res = clean_res[7:]
            if clean_res.endswith("```"):
                clean_res = clean_res[:-3]
                
            extracted = json.loads(clean_res.strip())
            cleaned = {k: v for k, v in extracted.items() if v is not None}
            merged = {**regex_details, **cleaned}
            if merged:
                logger.info(f"Auto-extracted birth details: {merged}")
                return merged
        except Exception as e:
            logger.exception("Birth details extraction failed:")
            logger.warning(f"Birth details extraction failed: {e}. Falling back to regex results.")
        
        return regex_details if regex_details else None

    def _has_complete_birth_details(self, details: Dict[str, Any]) -> bool:
        return all(details.get(field) for field in ["name", "date_of_birth", "time_of_birth", "place_of_birth"])

    async def summarize_history(self, history: List[ChatHistoryItem]) -> str:
        """
        Delegates history summarization to the new modular summarizer service.
        Kept for backward compatibility with existing tests and endpoints.
        """
        return await summarizer_service.summarize_history(history)

    def _validate_response_safety(self, response: str) -> str:
        """
        Validates LLM output against safety mandates.
        Kept for compatibility with legacy test suites.
        """
        replacements = {
            "I guarantee": "Planetary transits suggest a high probability",
            "will definitely marry": "has favorable configurations for marriage",
            "will win the lottery": "shows wealth-generation cycles, though gaming outcomes cannot be predicted",
            "will die on": "shows significant cycles of transition around",
            "is guaranteed to": "is likely to show tendencies to",
            "You will fail": "You may face lessons or obstacles"
        }
        
        audited_response = response
        for target, replacement in replacements.items():
            if target in audited_response:
                audited_response = audited_response.replace(target, replacement)

        disclaimer_trigger = "astrology offers interpretations"
        if disclaimer_trigger not in audited_response.lower():
            audited_response += (
                "\n\n---\n\n"
                "**Reminder:** Astrology offers interpretations of planetary energies rather than absolute physical certainties. "
                "Your free will and personal actions (Karma) remain the ultimate driving forces in shaping your life path."
            )
            
        return audited_response

    async def process_chat(
        self, 
        message: str, 
        birth_details: Optional[BirthDetails],
        history: List[ChatHistoryItem],
        astrology_data: Optional[Dict[str, Any]] = None,
        conversation_id: Optional[str] = None
    ) -> Tuple[str, Optional[Dict[str, Any]]]:
        """
        Main orchestration entry point. Plugs directly into existing routes.
        Loads, merges, and caches birth details statefully across messages.
        """
        # 1. Sanitize query input
        sanitized_message = sanitize_input(message)

        # 2. Load cached birth details for this conversation
        cached_details = None
        from app.services.cache import active_cache
        if conversation_id:
            try:
                cached_details = await active_cache.get(f"birth_details:{conversation_id}")
            except Exception as ce:
                logger.warning(f"Failed to fetch cached birth details: {ce}")

        # Baseline with cached details, overlay with payload request details
        merged_details = cached_details or {}
        if birth_details:
            req_dict = {k: v for k, v in birth_details.model_dump().items() if v is not None}
            merged_details.update(req_dict)

        # 3. Extract birth details from current user message. Once a complete profile
        # exists, avoid an extra Gemini extraction call on every astrology question.
        extracted_updates = (
            self._extract_birth_details_regex(sanitized_message)
            if self._has_complete_birth_details(merged_details)
            else await self.extract_birth_details(sanitized_message)
        )
        if extracted_updates:
            merged_details.update(extracted_updates)

        # 4. Persist updated birth details back to the active cache
        if conversation_id and merged_details:
            try:
                await active_cache.set(f"birth_details:{conversation_id}", merged_details, ttl_seconds=86400)
            except Exception as ce:
                logger.warning(f"Failed to cache birth details: {ce}")

        # 5. Process query through the new modular Planner
        planner_result = await self.planner.process_query(
            message=sanitized_message,
            birth_details=BirthDetails(**merged_details) if merged_details else None,
            history=history,
            astrology_data=astrology_data
        )

        reply = planner_result.get("response_text", "I am unable to interpret planetary placements at this time.")
        
        # Apply absolute statements checks to final formatted response
        reply = self._validate_response_safety(reply)

        return reply, (merged_details if merged_details else None)

# Singleton instance
ai_engine = AIEngine()
