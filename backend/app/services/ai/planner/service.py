import time
import logging
from typing import List, Dict, Any, Optional, Tuple, AsyncIterator
from app.schemas.astrology import BirthDetails
from app.schemas.chat import ChatHistoryItem
from app.services.ai.providers import ai_provider
from app.services.ai.config import ai_settings
from app.services.ai.prompt_manager import prompt_manager
from app.services.ai.moderation.service import moderation_service
from app.services.ai.router.service import ai_router
from app.services.ai.memory.service import ConversationMemory
from app.services.ai.formatter.service import formatter_service
from app.services.ai.recommendation.service import recommendation_service
from app.services.ai.telemetry.service import telemetry_service

logger = logging.getLogger("app.services.ai.planner")

class AIPlanner:
    """
    AI Orchestrator / Planner. Coordinating intent detection, moderation checks,
    memory formatting, model execution (sync/stream), recommendations, and telemetry.
    """
    def __init__(self):
        self.provider = ai_provider

    async def process_query(
        self,
        message: str,
        birth_details: Optional[BirthDetails],
        history: List[ChatHistoryItem],
        astrology_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes the full synchronous orchestration pipeline.
        """
        start_time = time.perf_counter()
        
        # 1. Moderation Audit
        is_safe, unsafe_reason = moderation_service.audit_input(message)
        if not is_safe:
            telemetry_service.log_call(
                model_name="moderation",
                latency_seconds=time.perf_counter() - start_time,
                prompt_chars=len(message),
                response_chars=len(unsafe_reason),
                error="Moderation Block"
            )
            return {
                "response_text": f"I cannot process this request: {unsafe_reason}",
                "intent": "moderated",
                "recommendations": [],
                "extracted_birth_details": None
            }

        # 2. Intent Detection
        routing_data = await ai_router.detect_intent(message)
        intent = routing_data.get("intent", "general")

        # 3. Memory Initialization (Sliding window and topic extraction)
        memory = ConversationMemory(history, birth_details)
        await memory.initialize()

        # 4. Formulate Prompt
        system_instruction = prompt_manager.get_prompt("system")
        
        composed_prompt = []
        if memory.long_term_summary:
            composed_prompt.append(f"### PRIOR SUMMARY\n{memory.long_term_summary}\n")
            
        if astrology_data:
            composed_prompt.append("### PLANETARY COORDINATES")
            for k, v in astrology_data.items():
                composed_prompt.append(f"- {k.replace('_', ' ').title()}: {v}")
            composed_prompt.append("\n" + "="*40 + "\n")

        # Compile details & sliding history
        details_block = ""
        if birth_details:
            details_block = (
                f"### USER BIRTH DETAILS\n"
                f"- Name: {birth_details.name}\n"
                f"- Gender: {birth_details.gender}\n"
                f"- Date of Birth: {birth_details.date_of_birth}\n"
                f"- Time of Birth: {birth_details.time_of_birth}\n"
                f"- Place of Birth: {birth_details.place_of_birth}\n"
                f"- Timezone: {birth_details.timezone}\n"
            )
            composed_prompt.append(details_block)

        history_block = "### CONVERSATION HISTORY\n"
        for item in memory.get_recent_history():
            role_label = "User" if item.role == "user" else "Astrologer"
            history_block += f"{role_label}: {item.content}\n"
        composed_prompt.append(history_block)

        composed_prompt.append(f"### CURRENT USER MESSAGE\nUser: {message.strip()}\n")
        final_prompt = "\n".join(composed_prompt)

        # 5. Call Provider
        error_msg = None
        raw_response = ""
        try:
            raw_response = await self.provider.generate(
                prompt=final_prompt,
                system_instruction=system_instruction
            )
        except Exception as e:
            error_msg = str(e)
            logger.exception("AI Planner query processing failed:")
            
            from app.config import settings
            if settings.ENVIRONMENT == "development" or settings.DEBUG:
                raise e
                
            if birth_details and birth_details.name and birth_details.date_of_birth:
                raw_response = (
                    "I have successfully aligned your chart coordinates, but the AI service is currently "
                    "experiencing a temporary connection issue. Please try again in a few moments."
                )
            else:
                raw_response = (
                    "I need your birth details before I can generate a personalized chart. Please provide:\n\n"
                    "* **Date of Birth**\n"
                    "* **Time of Birth**\n"
                    "* **Birth Place**\n\n"
                    "If you have already submitted them, the server might be experiencing a temporary connection issue. Please try again."
                )

        # Log the full response before formatting
        logger.info(f"Raw Gemini response: {raw_response}")

        # 6. Format Response
        formatted_response = formatter_service.format_response(raw_response)

        # 7. Get Recommendations
        topics_str = ", ".join(memory.recent_topics)
        recs = await recommendation_service.get_recommendations(intent, topics_str)

        # 8. Log Telemetry
        latency = time.perf_counter() - start_time
        telemetry_service.log_call(
            model_name=ai_settings.AI_MODEL,
            latency_seconds=latency,
            prompt_chars=len(final_prompt),
            response_chars=len(formatted_response),
            error=error_msg
        )

        return {
            "response_text": formatted_response,
            "intent": intent,
            "recommendations": recs,
            "extracted_birth_details": None # Extracted dynamically by AIEngine if needed
        }

    async def process_query_stream(
        self,
        message: str,
        birth_details: Optional[BirthDetails],
        history: List[ChatHistoryItem],
        astrology_data: Optional[Dict[str, Any]] = None
    ) -> AsyncIterator[str]:
        """
        Streams response tokens incrementally.
        """
        # 1. Moderation check
        is_safe, unsafe_reason = moderation_service.audit_input(message)
        if not is_safe:
            yield f"I cannot process this request: {unsafe_reason}"
            return

        # 2. Initialize Memory
        memory = ConversationMemory(history, birth_details)
        await memory.initialize()

        # 3. Formulate Prompt
        system_instruction = prompt_manager.get_prompt("system")
        composed_prompt = []
        if memory.long_term_summary:
            composed_prompt.append(f"### PRIOR SUMMARY\n{memory.long_term_summary}\n")
            
        if astrology_data:
            composed_prompt.append("### PLANETARY COORDINATES")
            for k, v in astrology_data.items():
                composed_prompt.append(f"- {k.replace('_', ' ').title()}: {v}")
            composed_prompt.append("\n" + "="*40 + "\n")

        if birth_details:
            details_block = (
                f"### USER BIRTH DETAILS\n"
                f"- Name: {birth_details.name}\n"
                f"- Gender: {birth_details.gender}\n"
                f"- Date of Birth: {birth_details.date_of_birth}\n"
                f"- Time of Birth: {birth_details.time_of_birth}\n"
                f"- Place of Birth: {birth_details.place_of_birth}\n"
                f"- Timezone: {birth_details.timezone}\n"
            )
            composed_prompt.append(details_block)

        history_block = "### CONVERSATION HISTORY\n"
        for item in memory.get_recent_history():
            role_label = "User" if item.role == "user" else "Astrologer"
            history_block += f"{role_label}: {item.content}\n"
        composed_prompt.append(history_block)

        composed_prompt.append(f"### CURRENT USER MESSAGE\nUser: {message.strip()}\n")
        final_prompt = "\n".join(composed_prompt)

        # 4. Stream response
        try:
            async for chunk in self.provider.generate_stream(
                prompt=final_prompt,
                system_instruction=system_instruction
            ):
                yield chunk
        except Exception as e:
            logger.error(f"Streaming failed: {e}")
            from app.config import settings
            if settings.ENVIRONMENT == "development" or settings.DEBUG:
                raise e
            yield " [Stream interruption. Please try again.] "

ai_planner = AIPlanner()
