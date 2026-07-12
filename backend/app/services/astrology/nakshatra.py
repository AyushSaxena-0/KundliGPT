from typing import Tuple

class NakshatraCalculator:
    """
    Service responsible for calculating Nakshatra (Lunar Mansion)
    and Pada sub-divisions based on absolute sidereal longitude.
    """
    def __init__(self):
        # 27 traditional Nakshatras in order
        self.nakshatras = [
            "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", 
            "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", 
            "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", 
            "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", 
            "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", 
            "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
        ]
        
        # 12 Vedic Zodiac Signs (Rashis)
        self.rashis = [
            "Aries (Mesha)", "Taurus (Vrishabha)", "Gemini (Mithuna)", 
            "Cancer (Karka)", "Leo (Simha)", "Virgo (Kanya)", 
            "Libra (Tula)", "Scorpio (Vrishchika)", "Sagittarius (Dhanu)", 
            "Capricorn (Makara)", "Aquarius (Kumbha)", "Pisces (Meena)"
        ]

    def get_nakshatra_info(self, longitude: float) -> Tuple[str, int]:
        """
        Calculates the Nakshatra name and Pada number for a given longitude.
        Each Nakshatra spans exactly 13.3333 degrees (13° 20').
        Each Pada spans exactly 3.3333 degrees (3° 20').
        """
        # Normalize longitude to [0, 360]
        lon = longitude % 360.0
        
        nakshatra_span = 360.0 / 27.0 # 13.33333...
        pada_span = nakshatra_span / 4.0 # 3.33333...

        nakshatra_idx = int(lon // nakshatra_span)
        pada_idx = int((lon % nakshatra_span) // pada_span) + 1

        # Safeguard indices
        nakshatra_idx = min(max(nakshatra_idx, 0), 26)
        pada_idx = min(max(pada_idx, 1), 4)

        return self.nakshatras[nakshatra_idx], pada_idx

    def get_zodiac_sign(self, longitude: float) -> Tuple[str, float]:
        """
        Calculates the Vedic Zodiac Sign and the relative degrees within that sign.
        Each sign spans exactly 30 degrees.
        """
        lon = longitude % 360.0
        sign_idx = int(lon // 30.0)
        degrees_in_sign = lon % 30.0

        sign_idx = min(max(sign_idx, 0), 11)
        return self.rashis[sign_idx], degrees_in_sign

# Singleton instance
nakshatra_calculator = NakshatraCalculator()
