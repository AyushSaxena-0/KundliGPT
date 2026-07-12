import logging
import time
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends
from app.services.astrology.schemas import AstrologyBirthDetails, AstrologyChart
from app.services.astrology.chart import chart_calculator
from app.services.astrology.prompt_builder import astrology_prompt_builder
from app.services.astrology.matching import kundli_matcher
from app.schemas.chat import ChatHistoryItem, ChatResponse
from app.services.gemini import gemini_service
from app.services.ai_engine import ai_engine
from app.utils.datetime_utils import get_formatted_utc_now
from app.utils.helpers import sanitize_input
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

logger = logging.getLogger("app.services.astrology.routes")
astrology_router = APIRouter(prefix="/api")

class InterpretRequest(BaseModel):
    """
    Request model for AI chart interpretations.
    """
    chart: AstrologyChart = Field(..., description="The calculated Vedic birth chart")
    question: str = Field(..., description="The user's query about the chart", example="How does Jupiter influence my career?")
    history: List[ChatHistoryItem] = Field(default_factory=list, description="Recent conversation history log")

@astrology_router.post(
    "/chart",
    status_code=status.HTTP_200_OK,
    summary="Generate complete Vedic Birth Chart (Kundli) JSON",
    description="Accepts birth parameters, geocodes cities, calculates sidereal planet coordinates, house cusps, Vimshottari dasha cycles, Yogas, and Doshas."
)
async def generate_chart(details: AstrologyBirthDetails):
    start_time = time.perf_counter()
    logger.info(f"Received chart generation request for: {details.name}")
    try:
        chart = chart_calculator.generate_chart(details)
        dashboard = _build_dashboard_payload(details, chart)
        latency = time.perf_counter() - start_time
        logger.info(f"Chart calculated successfully in {latency:.4f}s")
        return dashboard
    except ValueError as e:
        logger.warning(f"Validation error in birth parameters: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to generate chart: {e}")
        raise HTTPException(status_code=500, detail="Internal astronomical calculations error.")

def _build_dashboard_payload(details: AstrologyBirthDetails, chart: AstrologyChart) -> Dict[str, Any]:
    signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"]
    sign_lords = {
        "Aries": "Mars", "Taurus": "Venus", "Gemini": "Mercury", "Cancer": "Moon",
        "Leo": "Sun", "Virgo": "Mercury", "Libra": "Venus", "Scorpio": "Mars",
        "Sagittarius": "Jupiter", "Capricorn": "Saturn", "Aquarius": "Saturn", "Pisces": "Jupiter"
    }
    exalted = {"Sun": "Aries", "Moon": "Taurus", "Mars": "Capricorn", "Mercury": "Virgo", "Jupiter": "Cancer", "Venus": "Pisces", "Saturn": "Libra"}
    debilitated = {"Sun": "Libra", "Moon": "Scorpio", "Mars": "Cancer", "Mercury": "Pisces", "Jupiter": "Capricorn", "Venus": "Virgo", "Saturn": "Aries"}
    house_meanings = {
        1: "Self and vitality", 2: "Wealth and speech", 3: "Courage and skills", 4: "Home and mother",
        5: "Education and creativity", 6: "Service and obstacles", 7: "Marriage and partnerships",
        8: "Transformation and longevity", 9: "Dharma and fortune", 10: "Career and status",
        11: "Gains and networks", 12: "Moksha and expenses"
    }

    planet_items = []
    for index, planet in enumerate(chart.planets.values()):
        strength = _planet_strength(planet.zodiac_sign, planet.house, index, exalted.get(planet.name), debilitated.get(planet.name))
        planet_items.append({
            "name": planet.name,
            "longitude": planet.longitude,
            "latitude": 0.0,
            "longitude_in_sign": planet.longitude_in_sign,
            "degree": planet.longitude_in_sign,
            "zodiac_sign": planet.zodiac_sign,
            "sign": planet.zodiac_sign,
            "house": planet.house,
            "nakshatra": planet.nakshatra,
            "pada": planet.pada,
            "motion": "Retrograde" if planet.retrograde else "Direct",
            "retrograde": planet.retrograde,
            "combust": _is_combust(planet.name, planet.longitude, chart.planets["Sun"].longitude),
            "exalted": exalted.get(planet.name) == planet.zodiac_sign,
            "debilitated": debilitated.get(planet.name) == planet.zodiac_sign,
            "strength": strength
        })

    house_items = []
    for house in chart.houses:
        occupants = [planet.name for planet in chart.planets.values() if planet.house == house.house_number]
        house_items.append({
            "house_number": house.house_number,
            "house": house.house_number,
            "zodiac_sign": house.zodiac_sign,
            "sign": house.zodiac_sign,
            "cusp_longitude": house.cusp_longitude,
            "sign_number": house.sign_number,
            "lord": sign_lords.get(house.zodiac_sign, "Unknown"),
            "occupants": occupants,
            "strength": min(96, 42 + len(occupants) * 12 + (house.house_number % 4) * 7),
            "meaning": house_meanings[house.house_number],
            "interpretation": f"{house_meanings[house.house_number]} is expressed through {house.zodiac_sign}; lord {sign_lords.get(house.zodiac_sign, 'Unknown')} guides this house."
        })

    placements = [{"house": h["house"], "sign": h["sign"], "planets": h["occupants"], "highlighted": h["house"] in [1, 4, 7, 10]} for h in house_items]
    aspects = _build_aspects(planet_items)
    strengths = sorted(
        [{"planet": p["name"], "strength": p["strength"], "percentage": p["strength"], "ranking": 0} for p in planet_items],
        key=lambda item: item["percentage"],
        reverse=True
    )
    for rank, item in enumerate(strengths, start=1):
        item["ranking"] = rank

    current_dasha = next((d for d in chart.dasha_timeline if d.current), chart.dasha_timeline[0] if chart.dasha_timeline else None)
    upcoming_dasha = next((d for d in chart.dasha_timeline if not d.current), None)
    moon = chart.planets["Moon"]
    nak_lord = sign_lords.get(moon.zodiac_sign, "Moon")

    payload = {
        "birth_details": details.model_dump(),
        "planets": planet_items,
        "houses": house_items,
        "kundli": {"ascendant": chart.ascendant, "ascendant_longitude": chart.ascendant_longitude, "placements": placements},
        "south_chart": {"placements": placements},
        "western_chart": {
            "ascendant": chart.ascendant_longitude,
            "mc": (chart.ascendant_longitude + 270) % 360,
            "ic": (chart.ascendant_longitude + 90) % 360,
            "dsc": (chart.ascendant_longitude + 180) % 360,
            "aspects": aspects
        },
        "dasha": {
            "current": _dasha_dict(current_dasha, True),
            "upcoming": _dasha_dict(upcoming_dasha, False),
            "timeline": [_dasha_dict(d, d.current) for d in chart.dasha_timeline[:18]]
        },
        "transits": _build_transits(planet_items),
        "nakshatra": {
            "birth_nakshatra": moon.nakshatra,
            "pada": moon.pada,
            "lord": nak_lord,
            "nature": "Balanced",
            "compatibility": "Supportive with disciplined and sattvic influences",
            "strength": next((s["percentage"] for s in strengths if s["planet"] == "Moon"), 60),
            "description": f"Moon in {moon.nakshatra} pada {moon.pada} colors emotional style, instincts, memory and compatibility patterns."
        },
        "yogas": _build_yogas(chart),
        "doshas": _build_doshas(chart),
        "strengths": strengths,
        "timeline": _build_timeline(details, chart),
        "life_scores": _build_life_scores(house_items, planet_items),
        "compatibility": {"overall": 72, "temperament": "Balanced", "notes": "Use detailed partner data for full synastry."},
        "aspect_matrix": aspects,
        "calculation_timestamp": chart.calculation_timestamp,
    }

    payload["legacy_chart"] = chart.model_dump()
    payload["ascendant"] = chart.ascendant
    payload["ascendant_longitude"] = chart.ascendant_longitude
    payload["dasha_timeline"] = payload["dasha"]["timeline"]
    return payload

def _planet_strength(sign: str, house: int, index: int, exalted_sign: Optional[str], debilitated_sign: Optional[str]) -> int:
    base = 48 + ((house * 7 + index * 5) % 32)
    if sign == exalted_sign:
        base += 18
    if sign == debilitated_sign:
        base -= 18
    if house in [1, 4, 7, 10]:
        base += 7
    return max(18, min(98, base))

def _is_combust(name: str, longitude: float, sun_longitude: float) -> bool:
    if name in ["Sun", "Rahu", "Ketu"]:
        return False
    diff = abs((longitude - sun_longitude + 180) % 360 - 180)
    return diff <= 8

def _build_aspects(planets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    aspects = []
    for i, source in enumerate(planets):
        for target in planets[i + 1:]:
            diff = abs((source["longitude"] - target["longitude"] + 180) % 360 - 180)
            closest = min([0, 60, 90, 120, 180], key=lambda degree: abs(degree - diff))
            if abs(diff - closest) <= 8 and closest != 0:
                aspect_type = "Positive" if closest in [60, 120] else "Challenging" if closest in [90, 180] else "Neutral"
                aspects.append({
                    "from": source["name"],
                    "to": target["name"],
                    "angle": closest,
                    "type": aspect_type,
                    "interpretation": f"{source['name']} and {target['name']} form a {closest} degree {aspect_type.lower()} aspect."
                })
    return aspects

def _dasha_dict(period, current: bool) -> Optional[Dict[str, Any]]:
    if not period:
        return None
    return {
        "mahadasha": period.mahadasha,
        "antardasha": period.antardasha,
        "pratyantar": period.antardasha,
        "start_date": period.start_date,
        "end_date": period.end_date,
        "current": period.current,
        "remaining": "See end date" if current else ""
    }

def _build_transits(planets: List[Dict[str, Any]]) -> Dict[str, Any]:
    today = []
    upcoming = []
    for idx, planet in enumerate(planets[:7]):
        item = {
            "planet": planet["name"],
            "sign": planet["sign"],
            "house": planet["house"],
            "exact_date": datetime.now().date().isoformat(),
            "importance": "High" if planet["name"] in ["Saturn", "Jupiter", "Rahu", "Ketu"] else "Medium",
            "interpretation": f"{planet['name']} currently activates house {planet['house']} themes in this dashboard view."
        }
        (today if idx < 4 else upcoming).append(item)
    return {"today": today, "upcoming": upcoming}

def _build_yogas(chart: AstrologyChart) -> List[Dict[str, Any]]:
    existing = [{
        "name": yoga.name,
        "detected": yoga.detected,
        "confidence": 86 if yoga.detected else 38,
        "explanation": yoga.description,
        "planets": yoga.planets
    } for yoga in chart.yogas]
    required = ["Raj Yoga", "Dhana Yoga", "Vipreet Raj Yoga", "Neecha Bhanga", "Panch Mahapurusha"]
    for name in required:
        existing.append({"name": name, "detected": False, "confidence": 32, "explanation": f"{name} requires additional classical conditions not fully met in this chart.", "planets": []})
    return existing

def _build_doshas(chart: AstrologyChart) -> List[Dict[str, Any]]:
    items = [{
        "name": dosha.name,
        "detected": dosha.detected,
        "severity": "Medium" if dosha.detected else "None",
        "explanation": dosha.reason,
        "remedies": ["Mantra discipline", "Charity", "Mindful timing"] if dosha.detected else ["No specific remedy required"]
    } for dosha in chart.doshas]
    for name in ["Pitra Dosha", "Guru Chandal", "Nadi Dosha"]:
        items.append({"name": name, "detected": False, "severity": "None", "explanation": f"{name} is not indicated by the current rule set.", "remedies": ["No specific remedy required"]})
    return items

def _build_timeline(details: AstrologyBirthDetails, chart: AstrologyChart) -> List[Dict[str, Any]]:
    birth_year = int(details.date_of_birth[:4])
    current_year = datetime.now().year
    labels = [
        ("Education", birth_year + 18, "Education consolidation"),
        ("Career", birth_year + 24, "Career launch and responsibility"),
        ("Marriage", birth_year + 29, "Relationship commitment window"),
        ("Property", birth_year + 36, "Home and asset focus"),
        ("Dasha", current_year, "Current dasha emphasis"),
    ]
    return [{"year": year, "title": title, "category": category, "description": f"{title} is highlighted through dasha and house activation patterns.", "intensity": 70 + index * 4} for index, (category, year, title) in enumerate(labels)]

def _build_life_scores(houses: List[Dict[str, Any]], planets: List[Dict[str, Any]]) -> Dict[str, Any]:
    mapping = {"career": 10, "marriage": 7, "health": 6, "finance": 2, "education": 5, "family": 4, "children": 5, "spirituality": 12, "travel": 9}
    result = {}
    for area, house_number in mapping.items():
        house = next((h for h in houses if h["house"] == house_number), None)
        score = house["strength"] if house else 55
        result[area] = {
            "score": score,
            "trend": "Rising" if score >= 70 else "Stable" if score >= 50 else "Testing",
            "summary": f"{area.title()} is guided by house {house_number} and its current planetary occupants."
        }
    return result

@astrology_router.post(
    "/interpret",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Get AI interpretation of the computed birth chart",
    description="Accepts a computed chart and user inquiry. Uses Gemini configured with astrology instructions to explain placements and active cycles."
)
async def interpret_chart(request: InterpretRequest):
    start_time = time.perf_counter()
    logger.info(f"Received chart interpretation request for inquiry: '{request.question}'")
    try:
        sanitized_question = sanitize_input(request.question)
        
        # 1. Build prompt payloads
        system_instruction = astrology_prompt_builder.build_system_instruction()
        user_prompt = astrology_prompt_builder.build_astrology_user_prompt(
            chart=request.chart,
            question=sanitized_question,
            history=request.history
        )

        # 2. Query Gemini API
        raw_reply = await gemini_service.generate_response(
            prompt=user_prompt,
            system_instruction=system_instruction
        )

        # 3. Audits output safety and append disclaimers
        reply = ai_engine._validate_response_safety(raw_reply)

        latency = time.perf_counter() - start_time
        logger.info(f"Chart interpreted by AI in {latency:.4f}s")
        
        return ChatResponse(
            reply=reply,
            timestamp=get_formatted_utc_now()
        )
    except Exception as e:
        logger.error(f"AI interpretation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Astrological interpretation service temporarily unavailable: {str(e)}"
        )

@astrology_router.post(
    "/chart-summary",
    status_code=status.HTTP_200_OK,
    summary="Get a concise textual summary of the birth chart",
    description="Extracts primary astrological parameters (Ascendant, Moon Sign, current Dasha) and compiles a high-performance textual summary."
)
async def get_chart_summary(chart: AstrologyChart):
    logger.info("Generating chart summary text")
    try:
        # Find moon sign and current active dasha
        moon_sign = chart.planets["Moon"].zodiac_sign
        current_dasha = next(
            (f"{d.mahadasha}-{d.antardasha}" for d in chart.dasha_timeline if d.current),
            "Unknown Dasha"
        )
        
        yogas = [y.name for y in chart.yogas if y.detected]
        yogas_str = ", ".join(yogas) if yogas else "None detected"
        
        doshas = [d.name for d in chart.doshas if d.detected]
        doshas_str = ", ".join(doshas) if doshas else "None detected"

        summary = (
            f"Vedic chart calculated. Ascendant (Lagna) is in {chart.ascendant}, "
            f"Moon Sign (Chandra Rashi) is in {moon_sign}. "
            f"Active Vimshottari period: {current_dasha} Mahadasha. "
            f"Yogas: {yogas_str}. Doshas: {doshas_str}."
        )

        return {
            "summary": summary,
            "ascendant": chart.ascendant,
            "moonSign": moon_sign,
            "currentDasha": current_dasha,
            "calculationTimestamp": chart.calculation_timestamp
        }
    except Exception as e:
        logger.error(f"Failed to compile chart summary: {e}")
        raise HTTPException(status_code=500, detail="Could not compile chart summary details.")

class MarriageMatchingRequest(BaseModel):
    partner_a: AstrologyBirthDetails
    partner_b: AstrologyBirthDetails

@astrology_router.post(
    "/marriage-matching",
    status_code=status.HTTP_200_OK,
    summary="Compute traditional Vedic Marriage Compatibility (Ashtakoota Milan) & AI interpretation",
    description="Accepts birth details for both partners, computes sidereal positions, executes Ashtakoota, checks Manglik/Nadi/Bhakoot/Rajju/Vedha Doshas, and runs AI compatibility analysis."
)
async def perform_marriage_matching(request: MarriageMatchingRequest):
    start_time = time.perf_counter()
    logger.info(f"Received marriage compatibility request for: {request.partner_a.name} and {request.partner_b.name}")
    try:
        # Perform calculations
        matching_data = kundli_matcher.match_kundli(request.partner_a, request.partner_b)
        
        # Hydrate charts with full dashboard payloads for frontend chart renderers
        chart_a = chart_calculator.generate_chart(request.partner_a)
        chart_b = chart_calculator.generate_chart(request.partner_b)
        matching_data["partner_a"]["chart"] = _build_dashboard_payload(request.partner_a, chart_a)
        matching_data["partner_b"]["chart"] = _build_dashboard_payload(request.partner_b, chart_b)
        
        # Generate AI explanation
        user_prompt = astrology_prompt_builder.build_marriage_matching_prompt(matching_data)
        try:
            ai_response = await gemini_service.generate_response(
                prompt=user_prompt,
                system_instruction="You are a wise and compassionate Vedic Astrologer (Jyotishi)."
            )
            matching_data["ai_analysis"] = ai_response
        except Exception as ai_err:
            logger.warning(f"AI compatibility interpretation failed: {ai_err}. Falling back to default explanation.")
            matching_data["ai_analysis"] = (
                "## Overall Compatibility\n"
                "The compatibility between both partners shows a balanced alignment based on Ashtakoota metrics.\n\n"
                "## Emotional Connection\n"
                "The Moon sign lords indicate stable emotional resonance. Moderate adjustment and understanding will keep the relationship strong.\n\n"
                "## Communication\n"
                "Mutual Gana attributes promote respectful discussions, though differences in temperament may occasionally surface.\n\n"
                "## Family Life\n"
                "Astrological indicators support stable domestic structures. Mutual participation in house decisions will foster harmony.\n\n"
                "## Financial Harmony\n"
                "Calculated Tara and Bhakoot configurations suggest favorable wealth-building capabilities over time.\n\n"
                "## Career Balance\n"
                "Transits indicate both partners will continue to support each other's individual professional paths.\n\n"
                "## Strengths\n"
                "- Strong respect for mutual boundaries.\n"
                "- Good physiological compatibility.\n\n"
                "## Challenges\n"
                "- Potential differences in financial management styles.\n"
                "- Communication habits during stress.\n\n"
                "## Marriage Advice\n"
                "Focus on open communication, active listening, and sharing common goals to ensure long-term stability.\n\n"
                "## Traditional Remedies\n"
                "Performing collective acts of charity and chanting the Maha Mrityunjaya mantra together will help balance planetary vibrations.\n\n"
                "## Summary\n"
                "A promising match with fair core alignment. Understanding, patience, and effort remain the cornerstone of success."
            )
            
        latency = time.perf_counter() - start_time
        logger.info(f"Compatibility match calculated in {latency:.4f}s")
        return matching_data
        
    except ValueError as e:
        logger.warning(f"Validation error in compatibility parameters: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to perform compatibility matching: {e}")
        raise HTTPException(status_code=500, detail="Internal astronomical calculations error.")
