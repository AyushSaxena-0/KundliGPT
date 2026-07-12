from typing import List, Optional
import logging
from app.services.astrology.schemas import AstrologyChart
from app.schemas.chat import ChatHistoryItem

logger = logging.getLogger("app.services.astrology.prompt_builder")

class AstrologyPromptBuilder:
    """
    Dedicated prompt engineering class for Vedic Astrology.
    Injects computed chart configurations, dashas, yogas, and doshas
    to guide the LLM to interpret computed chart facts rather than inventing them.
    """
    def __init__(self):
        pass

    def build_system_instruction(self) -> str:
        """
        System instructions specifically targeting detailed, structured,
        and safe astrological interpretations based on computed charts.
        """
        return (
            "You are a wise, highly experienced Vedic Astrologer (Jyotishi). "
            "You are provided with a computed birth chart (Kundli) in structured JSON format. "
            "You must interpret this chart objectively and explain the configurations in natural English.\n\n"
            "Guidelines:\n"
            "1. Base all your astrological assertions STRICTLY on the supplied chart data (Lagna, planet signs, houses, nakshatras). "
            "Never invent or make up planetary positions that are not in the chart.\n"
            "2. Adopt a warm, spiritual, yet highly practical and grounded tone. Use clear headings, tables (where appropriate), and bullet points.\n"
            "3. Structure your response into these sections:\n"
            "   - ## Interpretation (explain planetary placements, active dashas, or yoga impacts relevant to the user's question)\n"
            "   - ## Things to Reflect On (philosophical or psychological insights to consider)\n"
            "   - ## Practical Suggestions (remedies, self-discipline, meditation, or daily actions to balance energies)\n"
            "   - ## Reminder (Vedic disclaimer explaining that astrology describes energies/potentials and free will/karma dominates)\n"
            "4. Highlight any active Yogas (auspicious combinations) or Doshas (planetary challenges) if relevant to their inquiry.\n"
            "5. Respect domain boundaries: Never provide guaranteed outcomes or absolute timelines. Suggest consulting professional practitioners "
            "for specific financial, medical health, or legal decisions."
        )

    def build_astrology_user_prompt(
        self, 
        chart: AstrologyChart, 
        question: str, 
        history: List[ChatHistoryItem]
    ) -> str:
        """
        Composes the user prompt payload containing the user question,
        historical chat parameters, and structured chart facts.
        """
        prompt_parts = []

        # 1. Structured Chart Data Section
        prompt_parts.append("### COMPUTED CHART DETAILS")
        prompt_parts.append(f"- Ascendant (Lagna): {chart.ascendant} at {chart.ascendant_longitude}°")
        
        prompt_parts.append("\nPlanetary Placements:")
        for planet_name, p in chart.planets.items():
            prompt_parts.append(
                f"  * {planet_name}: Sign: {p.zodiac_sign} ({p.longitude_in_sign}°), House: {p.house}, "
                f"Nakshatra: {p.nakshatra} (Pada {p.pada}), Retrograde: {p.retrograde}"
            )

        # 2. Dasha Timelines
        prompt_parts.append("\nActive & Upcoming Vimshottari Dasha Periods:")
        current_dashas = [d for d in chart.dasha_timeline if d.current]
        upcoming_dashas = [d for d in chart.dasha_timeline if not d.current][:3] # next 3 periods
        
        for d in current_dashas:
            prompt_parts.append(f"  * CURRENT: Mahadasha: {d.mahadasha}, Antardasha: {d.antardasha} (Ends: {d.end_date})")
        for d in upcoming_dashas:
            prompt_parts.append(f"  * UPCOMING: Mahadasha: {d.mahadasha}, Antardasha: {d.antardasha} (Start: {d.start_date} to {d.end_date})")

        # 3. Yogas and Doshas
        prompt_parts.append("\nDetected Yogas:")
        detected_yogas = [y for y in chart.yogas if y.detected]
        if detected_yogas:
            for y in detected_yogas:
                prompt_parts.append(f"  * {y.name}: {y.description} (Planets involved: {', '.join(y.planets)})")
        else:
            prompt_parts.append("  * No major angular yogas detected.")

        prompt_parts.append("\nDetected Doshas:")
        detected_doshas = [d for d in chart.doshas if d.detected]
        if detected_doshas:
            for d in detected_doshas:
                prompt_parts.append(f"  * {d.name}: Detected: Yes. Reason: {d.reason} (Details: {d.supporting_data})")
        else:
            prompt_parts.append("  * No severe planetary doshas detected.")

        prompt_parts.append("\n" + "="*45 + "\n")

        # 4. Recent Chat History
        prompt_parts.append("### RECENT CONVERSATION HISTORY")
        if history:
            for item in history:
                role_label = "User" if item.role == "user" else "Astrologer"
                prompt_parts.append(f"{role_label}: {item.content}")
        else:
            prompt_parts.append("No previous exchanges in this session.")

        prompt_parts.append("\n" + "="*45 + "\n")

        # 5. Current Inquiry
        prompt_parts.append("### USER ASTROLOGICAL INQUIRY")
        prompt_parts.append(f"User: {question}")
        prompt_parts.append("\nAstrologer:")

        return "\n".join(prompt_parts)

    def build_marriage_matching_prompt(self, matching_data: dict) -> str:
        prompt_parts = []
        prompt_parts.append("You are a wise and compassionate Vedic Astrologer (Jyotishi) performing a premium Marriage Compatibility (Kundli Milan) interpretation.")
        prompt_parts.append("You are provided with computed astrological compatibility data between Partner A and Partner B. You must interpret this data objectively.")
        prompt_parts.append("NEVER invent or make up planetary positions. Only use the provided information.")
        
        prompt_parts.append("\n### COMPATIBILITY METADATA")
        prompt_parts.append(f"Partner A: Name: {matching_data['partner_a']['name']}, Gender: {matching_data['partner_a']['gender']}, Lagna: {matching_data['partner_a']['lagna']}, Moon Sign: {matching_data['partner_a']['moon_sign']}, Nakshatra: {matching_data['partner_a']['nakshatra']} (Pada {matching_data['partner_a']['pada']})")
        prompt_parts.append(f"Partner B: Name: {matching_data['partner_b']['name']}, Gender: {matching_data['partner_b']['gender']}, Lagna: {matching_data['partner_b']['lagna']}, Moon Sign: {matching_data['partner_b']['moon_sign']}, Nakshatra: {matching_data['partner_b']['nakshatra']} (Pada {matching_data['partner_b']['pada']})")
        
        prompt_parts.append("\n### ASHTAKOOTA SCORES")
        ashtakoota = matching_data["ashtakoota"]
        prompt_parts.append(f"Total Guna Milan Score: {ashtakoota['total_score']} / {ashtakoota['max_score']}")
        for koota_name, details in ashtakoota.items():
            if koota_name not in ["total_score", "max_score"]:
                prompt_parts.append(f"- {koota_name.title()}: {details['score']} / {details['max']} (Calculation: {details['explanation']})")
                
        prompt_parts.append("\n### DETECTED DOSHAS")
        for dosha_name, details in matching_data["doshas"].items():
            prompt_parts.append(f"- {dosha_name.upper()}: Status: {details['status']}, Explanation: {details['description']}")
            
        prompt_parts.append("\n### CALCULATED COMPATIBILITY SUB-SCORES")
        db = matching_data["dashboard"]
        prompt_parts.append(f"- Emotional: {db['emotional']}%")
        prompt_parts.append(f"- Communication: {db['communication']}%")
        prompt_parts.append(f"- Stability: {db['stability']}%")
        prompt_parts.append(f"- Harmony: {db['harmony']}%")
        prompt_parts.append(f"- Financial: {db['financial']}%")
        prompt_parts.append(f"- Physical: {db['physical']}%")
        prompt_parts.append(f"- Spiritual: {db['spiritual']}%")
        
        prompt_parts.append("\n### Instructions for formatting:")
        prompt_parts.append("Construct your response into exactly these sections, using clean markdown, headings, and bullet points where appropriate:")
        prompt_parts.append("## Overall Compatibility")
        prompt_parts.append("## Emotional Connection")
        prompt_parts.append("## Communication")
        prompt_parts.append("## Family Life")
        prompt_parts.append("## Financial Harmony")
        prompt_parts.append("## Career Balance")
        prompt_parts.append("## Strengths")
        prompt_parts.append("## Challenges")
        prompt_parts.append("## Marriage Advice")
        prompt_parts.append("## Traditional Remedies (only include if active doshas require it, otherwise briefly state no major remedies are needed)")
        prompt_parts.append("## Summary")
        prompt_parts.append("\nKeep the writing concise, wise, and practical. Do NOT write giant walls of text. Maximum 2–3 short paragraphs per section.")
        
        return "\n".join(prompt_parts)

# Singleton instance
astrology_prompt_builder = AstrologyPromptBuilder()
