import logging
from typing import Dict, Any, List, Tuple
from app.services.astrology.schemas import AstrologyBirthDetails, AstrologyChart
from app.services.astrology.chart import chart_calculator

logger = logging.getLogger("app.services.astrology.matching")

NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", 
    "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", 
    "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", 
    "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", 
    "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", 
    "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

RASHIS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

VARNA_RANKS = {
    "Cancer": 4, "Scorpio": 4, "Pisces": 4,          # Brahmin
    "Aries": 3, "Leo": 3, "Sagittarius": 3,          # Kshatriya
    "Taurus": 2, "Virgo": 2, "Capricorn": 2,          # Vaishya
    "Gemini": 1, "Libra": 1, "Aquarius": 1            # Shudra
}

SIGN_LORDS = {
    "Aries": "Mars", "Scorpio": "Mars",
    "Taurus": "Venus", "Libra": "Venus",
    "Gemini": "Mercury", "Virgo": "Mercury",
    "Cancer": "Moon",
    "Leo": "Sun",
    "Sagittarius": "Jupiter", "Pisces": "Jupiter",
    "Capricorn": "Saturn", "Aquarius": "Saturn"
}

GRAHA_RELATIONS = {
    "Sun": {"Moon": "F", "Mars": "F", "Jupiter": "F", "Mercury": "N", "Venus": "E", "Saturn": "E", "Sun": "F"},
    "Moon": {"Sun": "F", "Mercury": "F", "Mars": "N", "Jupiter": "N", "Venus": "N", "Saturn": "N", "Moon": "F"},
    "Mars": {"Sun": "F", "Moon": "F", "Jupiter": "F", "Venus": "N", "Saturn": "N", "Mercury": "E", "Mars": "F"},
    "Mercury": {"Sun": "F", "Venus": "F", "Mars": "N", "Jupiter": "N", "Saturn": "N", "Moon": "E", "Mercury": "F"},
    "Jupiter": {"Sun": "F", "Moon": "F", "Mars": "F", "Saturn": "N", "Mercury": "E", "Venus": "E", "Jupiter": "F"},
    "Venus": {"Mercury": "F", "Saturn": "F", "Mars": "N", "Jupiter": "N", "Sun": "E", "Moon": "E", "Venus": "F"},
    "Saturn": {"Mercury": "F", "Venus": "F", "Jupiter": "N", "Sun": "E", "Moon": "E", "Mars": "E", "Saturn": "F"}
}

YONI_MAP = {
    "Ashwini": "Horse", "Shatabhisha": "Horse",
    "Bharani": "Elephant", "Revati": "Elephant",
    "Krittika": "Sheep", "Pushya": "Sheep",
    "Rohini": "Snake", "Mrigashira": "Snake",
    "Ardra": "Dog", "Mula": "Dog",
    "Punarvasu": "Cat", "Ashlesha": "Cat",
    "Magha": "Rat", "Purva Phalguni": "Rat",
    "Uttara Phalguni": "Cow", "Uttarabhadrapada": "Cow",
    "Hasta": "Buffalo", "Swati": "Buffalo",
    "Chitra": "Tiger", "Vishakha": "Tiger",
    "Anuradha": "Deer", "Jyeshtha": "Deer",
    "Purva Ashadha": "Monkey", "Shravana": "Monkey",
    "Dhanishta": "Lion", "Poorvabhadrapada": "Lion",
    "Uttarashadha": "Mongoose"
}

YONI_ENEMIES = {
    ("Horse", "Buffalo"), ("Buffalo", "Horse"),
    ("Elephant", "Lion"), ("Lion", "Elephant"),
    ("Sheep", "Monkey"), ("Monkey", "Sheep"),
    ("Snake", "Mongoose"), ("Mongoose", "Snake"),
    ("Dog", "Deer"), ("Deer", "Dog"),
    ("Cat", "Rat"), ("Rat", "Cat"),
    ("Cow", "Tiger"), ("Tiger", "Cow")
}

YONI_FRIENDS = {
    ("Horse", "Deer"), ("Deer", "Horse"),
    ("Elephant", "Cow"), ("Cow", "Elephant"),
    ("Sheep", "Cow"), ("Cow", "Sheep"),
    ("Snake", "Cat"), ("Cat", "Snake"),
    ("Dog", "Monkey"), ("Monkey", "Dog"),
    ("Buffalo", "Cow"), ("Cow", "Buffalo"),
    ("Tiger", "Lion"), ("Lion", "Tiger")
}

GANA_MAP = {
    "Ashwini": "Deva", "Mrigashira": "Deva", "Punarvasu": "Deva", "Pushya": "Deva", 
    "Hasta": "Deva", "Swati": "Deva", "Anuradha": "Deva", "Shravana": "Deva", "Revati": "Deva",
    "Bharani": "Manushya", "Rohini": "Manushya", "Ardra": "Manushya", "Purva Phalguni": "Manushya", 
    "Uttara Phalguni": "Manushya", "Purva Ashadha": "Manushya", "Uttara Ashadha": "Manushya", 
    "Purva Bhadrapada": "Manushya", "Uttara Bhadrapada": "Manushya",
    "Krittika": "Rakshasa", "Ashlesha": "Rakshasa", "Magha": "Rakshasa", "Chitra": "Rakshasa", 
    "Vishakha": "Rakshasa", "Jyeshtha": "Rakshasa", "Mula": "Rakshasa", "Dhanishta": "Rakshasa", 
    "Shatabhisha": "Rakshasa"
}

NADI_MAP = {
    "Ashwini": "Adi", "Ardra": "Adi", "Punarvasu": "Adi", "Uttara Phalguni": "Adi", 
    "Hasta": "Adi", "Jyeshtha": "Adi", "Mula": "Adi", "Shatabhisha": "Adi", "Purva Bhadrapada": "Adi",
    "Bharani": "Madhya", "Mrigashira": "Madhya", "Pushya": "Madhya", "Purva Phalguni": "Madhya", 
    "Chitra": "Madhya", "Anuradha": "Madhya", "Purva Ashadha": "Madhya", "Dhanishta": "Madhya", "Uttara Bhadrapada": "Madhya",
    "Krittika": "Antya", "Rohini": "Antya", "Ashlesha": "Antya", "Magha": "Antya", 
    "Swati": "Antya", "Vishakha": "Antya", "Uttara Ashadha": "Antya", "Shravana": "Antya", "Revati": "Antya"
}

RAJJU_MAP = {
    "Mrigashira": "Shiro", "Chitra": "Shiro", "Dhanishta": "Shiro",
    "Rohini": "Kantha", "Ardra": "Kantha", "Hasta": "Kantha", "Swati": "Kantha", "Shravana": "Kantha", "Shatabhisha": "Kantha",
    "Krittika": "Udara", "Punarvasu": "Udara", "Uttara Phalguni": "Udara", "Vishakha": "Udara", "Uttara Ashadha": "Udara", "Purva Bhadrapada": "Udara",
    "Bharani": "Kati", "Pushya": "Kati", "Purva Phalguni": "Kati", "Anuradha": "Kati", "Purva Ashadha": "Kati", "Uttara Bhadrapada": "Kati",
    "Ashwini": "Pada", "Ashlesha": "Pada", "Magha": "Pada", "Jyeshtha": "Pada", "Mula": "Pada", "Revati": "Pada"
}

VEDHA_PAIRS = {
    ("Ashwini", "Jyeshtha"), ("Jyeshtha", "Ashwini"),
    ("Bharani", "Anuradha"), ("Anuradha", "Bharani"),
    ("Krittika", "Vishakha"), ("Vishakha", "Krittika"),
    ("Rohini", "Swati"), ("Swati", "Rohini"),
    ("Ardra", "Shravana"), ("Shravana", "Ardra"),
    ("Punarvasu", "Uttarashadha"), ("Uttarashadha", "Punarvasu"),
    ("Pushya", "Purva Ashadha"), ("Purva Ashadha", "Pushya"),
    ("Ashlesha", "Mula"), ("Mula", "Ashlesha"),
    ("Magha", "Revati"), ("Revati", "Magha"),
    ("Purva Phalguni", "Uttara Bhadrapada"), ("Uttara Bhadrapada", "Purva Phalguni"),
    ("Uttara Phalguni", "Purva Bhadrapada"), ("Purva Bhadrapada", "Uttara Phalguni"),
    ("Hasta", "Shatabhisha"), ("Shatabhisha", "Hasta"),
    ("Mrigashira", "Dhanishta"), ("Dhanishta", "Mrigashira")
}

VASHYA_MATRIX = {
    ("Manav", "Manav"): 2.0,
    ("Manav", "Chatushpada"): 1.0,
    ("Manav", "Jalachar"): 0.5,
    ("Manav", "Vanachar"): 0.5,
    ("Manav", "Keeta"): 1.0,
    
    ("Chatushpada", "Manav"): 1.0,
    ("Chatushpada", "Chatushpada"): 2.0,
    ("Chatushpada", "Jalachar"): 1.0,
    ("Chatushpada", "Vanachar"): 0.5,
    ("Chatushpada", "Keeta"): 1.0,
    
    ("Jalachar", "Manav"): 1.0,
    ("Jalachar", "Chatushpada"): 1.0,
    ("Jalachar", "Jalachar"): 2.0,
    ("Jalachar", "Vanachar"): 0.5,
    ("Jalachar", "Keeta"): 1.0,
    
    ("Vanachar", "Manav"): 0.0,
    ("Vanachar", "Chatushpada"): 0.0,
    ("Vanachar", "Jalachar"): 0.0,
    ("Vanachar", "Vanachar"): 2.0,
    ("Vanachar", "Keeta"): 0.0,
    
    ("Keeta", "Manav"): 1.0,
    ("Keeta", "Chatushpada"): 1.0,
    ("Keeta", "Jalachar"): 1.0,
    ("Keeta", "Vanachar"): 0.0,
    ("Keeta", "Keeta"): 2.0
}

def clean_sign(sign: str) -> str:
    if not sign:
        return "Aries"
    return sign.split()[0].strip()

def get_vashya(sign: str, lon_in_sign: float = 0.0) -> str:
    clean = clean_sign(sign)
    if clean in ["Aries", "Taurus"]:
        return "Chatushpada"
    elif clean in ["Gemini", "Virgo", "Libra", "Aquarius"]:
        return "Manav"
    elif clean in ["Cancer", "Pisces"]:
        return "Jalachar"
    elif clean == "Leo":
        return "Vanachar"
    elif clean == "Scorpio":
        return "Keeta"
    elif clean == "Sagittarius":
        return "Chatushpada" if lon_in_sign >= 15.0 else "Manav"
    elif clean == "Capricorn":
        return "Jalachar" if lon_in_sign >= 15.0 else "Chatushpada"
    return "Manav"

def get_nakshatra_index(nak_name: str) -> int:
    try:
        return NAKSHATRAS.index(nak_name) + 1
    except ValueError:
        return 1

class KundliMatcher:
    """
    Vedic astrology marriage matching orchestrator.
    Computes Ashtakoota compatibility, checks Vedic Doshas,
    and formats comprehensive compatibility dashboards.
    """
    
    def match_kundli(self, partner_a_details: AstrologyBirthDetails, partner_b_details: AstrologyBirthDetails) -> Dict[str, Any]:
        # 1. Generate charts
        chart_a = chart_calculator.generate_chart(partner_a_details)
        chart_b = chart_calculator.generate_chart(partner_b_details)
        
        # 2. Determine Bride and Groom Roles to keep Varna/Gana/Tara symmetric or aligned
        role_a = (partner_a_details.gender or "").lower()
        role_b = (partner_b_details.gender or "").lower()
        
        if role_a == "female" or role_b == "male":
            bride_chart, groom_chart = chart_a, chart_b
            bride_details, groom_details = partner_a_details, partner_b_details
        elif role_a == "male" or role_b == "female":
            bride_chart, groom_chart = chart_b, chart_a
            bride_details, groom_details = partner_b_details, partner_a_details
        else:
            # Default fallback
            bride_chart, groom_chart = chart_a, chart_b
            bride_details, groom_details = partner_a_details, partner_b_details
            
        b_moon = bride_chart.planets["Moon"]
        g_moon = groom_chart.planets["Moon"]
        
        # 3. Calculate Ashtakoota individual items
        varna_score, varna_desc = self._calc_varna(b_moon.zodiac_sign, g_moon.zodiac_sign)
        vashya_score, vashya_desc = self._calc_vashya(b_moon.zodiac_sign, b_moon.longitude_in_sign, g_moon.zodiac_sign, g_moon.longitude_in_sign)
        tara_score, tara_desc = self._calc_tara(b_moon.nakshatra, g_moon.nakshatra)
        yoni_score, yoni_desc = self._calc_yoni(b_moon.nakshatra, g_moon.nakshatra)
        maitri_score, maitri_desc = self._calc_graha_maitri(b_moon.zodiac_sign, g_moon.zodiac_sign)
        gana_score, gana_desc = self._calc_gana(b_moon.nakshatra, g_moon.nakshatra)
        bhakoot_score, bhakoot_desc = self._calc_bhakoot(b_moon.zodiac_sign, g_moon.zodiac_sign)
        nadi_score, nadi_desc = self._calc_nadi(b_moon.nakshatra, g_moon.nakshatra)
        
        total_score = varna_score + vashya_score + tara_score + yoni_score + maitri_score + gana_score + bhakoot_score + nadi_score
        
        # 4. Determine Dosha Alerts
        is_b_manglik = any(d.name == "Manglik Dosha" and d.detected for d in bride_chart.doshas)
        is_g_manglik = any(d.name == "Manglik Dosha" and d.detected for d in groom_chart.doshas)
        
        manglik_status = "Good"
        if is_b_manglik and is_g_manglik:
            manglik_status = "Warning"
            manglik_desc = "Both partners are Manglik. The Dosha is traditionally neutralized/canceled."
        elif is_b_manglik or is_g_manglik:
            manglik_status = "Needs Attention"
            manglik_desc = f"One partner is Manglik ({'Bride' if is_b_manglik else 'Groom'}), causing potential relationship friction."
        else:
            manglik_desc = "Neither partner is Manglik. Excellent compatibility."
            
        nadi_dosha_detected = (nadi_score == 0.0)
        nadi_status = "Needs Attention" if nadi_dosha_detected else "Good"
        nadi_desc = "Same Nadi found between partners. Traditionally warns of health or children issues." if nadi_dosha_detected else "Partners belong to different Nadis, promoting physical and vital harmony."
        
        bhakoot_dosha_detected = (bhakoot_score == 0.0)
        bhakoot_status = "Needs Attention" if bhakoot_dosha_detected else "Good"
        bhakoot_desc = "Inauspicious Moon sign relation detected (2/12, 5/9, or 6/8 alignment)." if bhakoot_dosha_detected else "Harmonious Moon sign relationship, facilitating emotional and financial gains."
        
        gana_dosha_detected = (gana_score == 0.0)
        gana_status = "Needs Attention" if gana_dosha_detected else "Good"
        gana_desc = "Significant Gana mismatch. Rakshasa temperament clashes with Deva/Manushya." if gana_dosha_detected else "Gana temperaments align nicely, ensuring mutual understanding."
        
        # Rajju Dosha
        b_rajju = RAJJU_MAP.get(b_moon.nakshatra, "Unknown")
        g_rajju = RAJJU_MAP.get(g_moon.nakshatra, "Unknown")
        rajju_dosha_detected = (b_rajju == g_rajju and b_rajju != "Unknown")
        rajju_status = "Needs Attention" if rajju_dosha_detected else "Good"
        rajju_desc = f"Both partners share the same Rajju ({b_rajju}). Strongly discouraged in Vedic matching." if rajju_dosha_detected else "Different Rajjus calculated. Safe and stable marital energy structure."
        
        # Vedha Dosha
        vedha_dosha_detected = ((b_moon.nakshatra, g_moon.nakshatra) in VEDHA_PAIRS)
        vedha_status = "Needs Attention" if vedha_dosha_detected else "Good"
        vedha_desc = "Mutual obstruction (Vedha) detected between partners' birth stars." if vedha_dosha_detected else "No Vedha (star obstruction) detected between birth stars."
        
        # 5. Generate Compatibility Dashboard metrics
        emotional_comp = int((bhakoot_score / 7.0 * 50) + (maitri_score / 5.0 * 50))
        communication = int((maitri_score / 5.0 * 60) + (gana_score / 6.0 * 40))
        marriage_stability = int((nadi_score / 8.0 * 55) + (0 if rajju_dosha_detected else 45))
        family_harmony = int((bhakoot_score / 7.0 * 65) + (varna_score / 1.0 * 35))
        financial_comp = int((tara_score / 3.0 * 50) + (bhakoot_score / 7.0 * 50))
        physical_comp = int((yoni_score / 4.0 * 65) + (vashya_score / 2.0 * 35))
        spiritual_comp = int((varna_score / 1.0 * 40) + (nadi_score / 8.0 * 30) + (gana_score / 6.0 * 30))
        
        # 6. Planet comparison table
        planet_comparison = []
        for p_name in ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"]:
            p_a = chart_a.planets.get(p_name)
            p_b = chart_b.planets.get(p_name)
            if p_a and p_b:
                planet_comparison.append({
                    "planet": p_name,
                    "partner_a": f"{p_a.zodiac_sign} ({p_a.longitude_in_sign:.1f}°), H{p_a.house}",
                    "partner_b": f"{p_b.zodiac_sign} ({p_b.longitude_in_sign:.1f}°), H{p_b.house}"
                })
                
        # 7. Timeline Predictions
        timeline = [
            {"period": "Engagement", "interpretation": "Favorable alignment of Jupiter and Moon suggests smooth and joyful initial commitment phase.", "year_offset": 0},
            {"period": "Marriage", "interpretation": "Strong 7th house compatibility indicates a beautiful wedding period with family support.", "year_offset": 1},
            {"period": "Early Married Life", "interpretation": "Graha Maitri alignment promises a quick bonding phase, although Vashya variations require patience.", "year_offset": 2},
            {"period": "Family Growth", "interpretation": "Comfortable Nadi placements support expansion, child planning, and home acquisitions.", "year_offset": 5},
            {"period": "Long-term Stability", "interpretation": "Saturn placements and overall dasha flow assure lasting companionship with stable finances.", "year_offset": 10}
        ]
        
        # 8. Assemble matching report
        return {
            "partner_a": {
                "name": partner_a_details.name,
                "gender": partner_a_details.gender,
                "lagna": chart_a.ascendant,
                "moon_sign": b_moon.zodiac_sign,
                "nakshatra": b_moon.nakshatra,
                "pada": b_moon.pada,
                "chart": chart_a.model_dump()
            },
            "partner_b": {
                "name": partner_b_details.name,
                "gender": partner_b_details.gender,
                "lagna": chart_b.ascendant,
                "moon_sign": g_moon.zodiac_sign,
                "nakshatra": g_moon.nakshatra,
                "pada": g_moon.pada,
                "chart": chart_b.model_dump()
            },
            "ashtakoota": {
                "varna": {"score": varna_score, "max": 1, "explanation": varna_desc},
                "vashya": {"score": vashya_score, "max": 2, "explanation": vashya_desc},
                "tara": {"score": tara_score, "max": 3, "explanation": tara_desc},
                "yoni": {"score": yoni_score, "max": 4, "explanation": yoni_desc},
                "graha_maitri": {"score": maitri_score, "max": 5, "explanation": maitri_desc},
                "gana": {"score": gana_score, "max": 6, "explanation": gana_desc},
                "bhakoot": {"score": bhakoot_score, "max": 7, "explanation": bhakoot_desc},
                "nadi": {"score": nadi_score, "max": 8, "explanation": nadi_desc},
                "total_score": total_score,
                "max_score": 36
            },
            "doshas": {
                "manglik": {"status": manglik_status, "description": manglik_desc, "detected": is_b_manglik or is_g_manglik},
                "nadi": {"status": nadi_status, "description": nadi_desc, "detected": nadi_dosha_detected},
                "bhakoot": {"status": bhakoot_status, "description": bhakoot_desc, "detected": bhakoot_dosha_detected},
                "gana": {"status": gana_status, "description": gana_desc, "detected": gana_dosha_detected},
                "rajju": {"status": rajju_status, "description": rajju_desc, "detected": rajju_dosha_detected},
                "vedha": {"status": vedha_status, "description": vedha_desc, "detected": vedha_dosha_detected}
            },
            "dashboard": {
                "overall_score": total_score,
                "rating": min(5.0, max(1.0, total_score / 36.0 * 5.0)),
                "verdict": self._get_verdict(total_score),
                "emotional": emotional_comp,
                "communication": communication,
                "stability": marriage_stability,
                "harmony": family_harmony,
                "financial": financial_comp,
                "physical": physical_comp,
                "spiritual": spiritual_comp
            },
            "planet_comparison": planet_comparison,
            "relationship_timeline": timeline
        }
        
    def _get_verdict(self, score: float) -> str:
        if score >= 28:
            return "Excellent Compatibility"
        elif score >= 21:
            return "Very Good Compatibility"
        elif score >= 18:
            return "Good Compatibility"
        elif score >= 14:
            return "Average Compatibility"
        else:
            return "Needs Careful Remedy & Guidance"

    def _calc_varna(self, b_sign: str, g_sign: str) -> Tuple[float, str]:
        b_clean = clean_sign(b_sign)
        g_clean = clean_sign(g_sign)
        b_rank = VARNA_RANKS.get(b_clean, 1)
        g_rank = VARNA_RANKS.get(g_clean, 1)
        if g_rank >= b_rank:
            return 1.0, "Both partners belong to compatible spiritual and work categories, facilitating mutual respect."
        else:
            return 0.0, "Groom has a lower Varna rank than Bride. Traditional matches prefer equal or higher Groom ranks."
            
    def _calc_vashya(self, b_sign: str, b_lon: float, g_sign: str, g_lon: float) -> Tuple[float, str]:
        b_v = get_vashya(b_sign, b_lon)
        g_v = get_vashya(g_sign, g_lon)
        score = VASHYA_MATRIX.get((b_v, g_v), 0.0)
        if score == 2.0:
            desc = f"Perfect magnetism and mutual control (Bride is '{b_v}' and Groom is '{g_v}')."
        elif score == 1.0:
            desc = f"Friendly attraction between '{b_v}' and '{g_v}' with balanced control."
        else:
            desc = f"Low natural attraction between '{b_v}' and '{g_v}' categories."
        return score, desc

    def _calc_tara(self, b_nak: str, g_nak: str) -> Tuple[float, str]:
        b_idx = get_nakshatra_index(b_nak)
        g_idx = get_nakshatra_index(g_nak)
        d1 = (g_idx - b_idx) % 9
        if d1 == 0: d1 = 9
        d2 = (b_idx - g_idx) % 9
        if d2 == 0: d2 = 9
        
        tara_meanings = {
            1: "Janma (Life)", 2: "Sampat (Wealth)", 3: "Vipat (Danger)",
            4: "Kshema (Safety)", 5: "Pratyak (Obstacles)", 6: "Sadhaka (Success)",
            7: "Naidhana (Destruction)", 8: "Mitra (Friendship)", 9: "Ati-Mitra (Deep Friend)"
        }
        
        bad_taras = {3, 5, 7}
        if d1 in bad_taras and d2 in bad_taras:
            return 0.0, f"Tara mismatch. Star relations indicate friction ({tara_meanings[d1]} and {tara_meanings[d2]})."
        elif d1 in bad_taras or d2 in bad_taras:
            return 1.5, f"Moderate Tara affinity. One partner faces minor hurdles ({tara_meanings[d1]} / {tara_meanings[d2]})."
        else:
            return 3.0, f"Excellent Tara compatibility. Promotes health, wealth, and destiny."

    def _calc_yoni(self, b_nak: str, g_nak: str) -> Tuple[float, str]:
        b_y = YONI_MAP.get(b_nak, "Cow")
        g_y = YONI_MAP.get(g_nak, "Cow")
        if b_y == g_y:
            return 4.0, f"Perfect physical harmony. Both share '{b_y}' Yoni."
        elif (b_y, g_y) in YONI_ENEMIES or (g_y, b_y) in YONI_ENEMIES:
            return 0.0, f"Physical incompatibility due to natural enmity between '{b_y}' and '{g_y}' Yonis."
        elif (b_y, g_y) in YONI_FRIENDS or (g_y, b_y) in YONI_FRIENDS:
            return 3.0, f"Good physical compatibility and friendship between '{b_y}' and '{g_y}' Yonis."
        else:
            return 2.0, f"Neutral physical affinity between '{b_y}' and '{g_y}' Yonis."

    def _calc_graha_maitri(self, b_sign: str, g_sign: str) -> Tuple[float, str]:
        b_clean = clean_sign(b_sign)
        g_clean = clean_sign(g_sign)
        l1 = SIGN_LORDS.get(b_clean, "Moon")
        l2 = SIGN_LORDS.get(g_clean, "Moon")
        r1 = GRAHA_RELATIONS.get(l1, {}).get(l2, "N")
        r2 = GRAHA_RELATIONS.get(l2, {}).get(l1, "N")
        
        if r1 == "F" and r2 == "F":
            return 5.0, f"Mutual friendship between Moon lords '{l1}' and '{l2}'. Perfect mental sync."
        elif (r1 == "F" and r2 == "N") or (r1 == "N" and r2 == "F"):
            return 4.0, f"Friendly relationship between Moon lords '{l1}' and '{l2}'."
        elif r1 == "N" and r2 == "N":
            return 3.0, f"Sign lords '{l1}' and '{l2}' are mutually neutral. Respectful connection."
        elif (r1 == "E" and r2 == "F") or (r1 == "F" and r2 == "E"):
            return 2.0, f"Average compatibility. Friction possible between sign lords '{l1}' and '{l2}'."
        elif (r1 == "E" and r2 == "N") or (r1 == "N" and r2 == "E"):
            return 1.0, f"Low Graha Maitri. Conflicting minds between lords '{l1}' and '{l2}'."
        else:
            return 0.0, f"Mutual enmity between Moon sign lords '{l1}' and '{l2}'."

    def _calc_gana(self, b_nak: str, g_nak: str) -> Tuple[float, str]:
        b_g = GANA_MAP.get(b_nak, "Manushya")
        g_g = GANA_MAP.get(g_nak, "Manushya")
        
        if b_g == g_g:
            return 6.0, f"Perfect alignment. Both belong to '{b_g}' Gana."
        elif (b_g == "Deva" and g_g == "Manushya") or (b_g == "Manushya" and g_g == "Deva"):
            return 5.0, f"Excellent compatibility. '{b_g}' Gana and '{g_g}' Gana complement each other."
        elif b_g == "Deva" and g_g == "Rakshasa":
            return 1.0, "Moderate friction. Deva Bride can pacify Rakshasa Groom."
        else:
            return 0.0, f"Gana Mismatch (Gana Dosha). Temperaments of '{b_g}' (Bride) and '{g_g}' (Groom) clash."

    def _calc_bhakoot(self, b_sign: str, g_sign: str) -> Tuple[float, str]:
        b_clean = clean_sign(b_sign)
        g_clean = clean_sign(g_sign)
        try:
            b_idx = RASHIS.index(b_clean)
            g_idx = RASHIS.index(g_clean)
        except ValueError:
            return 7.0, "Same Moon sign. Promotes emotional unity."
            
        diff_b_to_g = (g_idx - b_idx) % 12 + 1
        diff_g_to_b = (b_idx - g_idx) % 12 + 1
        bad_relations = {(2, 12), (12, 2), (6, 8), (8, 6), (5, 9), (9, 5)}
        
        if (diff_b_to_g, diff_g_to_b) in bad_relations:
            if diff_b_to_g in [6, 8]:
                return 0.0, "Shadastak (6/8) Moon relationship: emotional distances and health challenges (Bhakoot Dosha)."
            elif diff_b_to_g in [2, 12]:
                return 0.0, "Dwirdwadashe (2/12) Moon relationship: financial mismatches or extra expenditures (Bhakoot Dosha)."
            else:
                return 0.0, "Navapancham (5/9) Moon relationship: compatibility stress or progeny obstacles (Bhakoot Dosha)."
        return 7.0, f"Auspicious Rashi relationship ({diff_b_to_g}/{diff_g_to_b} relation) promoting lifetime harmony."

    def _calc_nadi(self, b_nak: str, g_nak: str) -> Tuple[float, str]:
        b_n = NADI_MAP.get(b_nak, "Adi")
        g_n = NADI_MAP.get(g_nak, "Adi")
        if b_n == g_n:
            return 0.0, f"Nadi Dosha detected. Both share '{b_n}' Nadi, indicating potential metabolic or children risks."
        return 8.0, f"Excellent physiological balance. Partners have different Nadis ({b_n} and {g_n})."

# Singleton
kundli_matcher = KundliMatcher()
