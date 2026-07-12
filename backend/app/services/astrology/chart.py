import time
import math
import logging
from datetime import datetime, UTC
from typing import Dict, Any, List, Tuple
from app.services.astrology.schemas import (
    AstrologyBirthDetails,
    PlanetPosition,
    HousePosition,
    DashaPeriod,
    AstrologyYoga,
    AstrologyDosha,
    AstrologyChart
)
from app.services.astrology.geocoder import geocoder
from app.services.astrology.ephemeris import ephemeris_calculator
from app.services.astrology.nakshatra import nakshatra_calculator
from app.services.astrology.dasha import dasha_calculator

logger = logging.getLogger("app.services.astrology.chart")

class ChartCalculator:
    """
    Main orchestrator for generating Vedic Birth Charts (Kundli).
    Coordinates Geocoding, Astronomical Ephemeris, Nakshatra, Dasha,
    Yoga, and Dosha calculators.
    """
    def __init__(self):
        pass

    def _calculate_ascendant(self, jd: float, lat: float, lon: float) -> float:
        """
        Calculates Lagna (Ascendant) degree based on local Sidereal Time
        and birth latitude. Accounts for Ayanamsha offset to get Sidereal Ascendant.
        """
        # Local Sidereal Time approximation (J2000.0)
        t = (jd - 2451545.0) / 36525.0
        
        # Greenwich Mean Sidereal Time (GMST) in degrees
        gmst = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * t*t - (t*t*t / 38710000.0)) % 360.0
        
        # Local Sidereal Time (LST) in degrees
        lst = (gmst + lon) % 360.0
        lst_rad = math.radians(lst)
        
        # Obliquity of Ecliptic
        epsilon = math.radians(23.439 - 0.013 * t)
        lat_rad = math.radians(lat)
        
        # Ascendant formula
        num = -math.cos(lst_rad)
        den = math.sin(lst_rad) * math.cos(epsilon) - math.tan(lat_rad) * math.sin(epsilon)
        
        ascendant_tropical = math.degrees(math.atan2(num, den)) % 360.0
        
        # Convert to Sidereal (Lahiri)
        ayanamsha = ephemeris_calculator.get_ayanamsha(jd)
        ascendant_sidereal = (ascendant_tropical - ayanamsha) % 360.0
        
        return ascendant_sidereal

    def _determine_planet_house(self, planet_lon: float, ascendant_lon: float) -> int:
        """
        Assigns planet to a house (1-12) using the Equal House System.
        Each house spans exactly 30 degrees starting from the Ascendant degree.
        """
        diff = (planet_lon - ascendant_lon) % 360.0
        house = int(diff // 30.0) + 1
        return house

    def _audit_yogas(self, planet_placements: Dict[str, PlanetPosition]) -> List[AstrologyYoga]:
        """
        Audits the chart for core Vedic Yogas.
        """
        yogas = []
        
        # 1. Gaja Kesari Yoga: Jupiter and Moon in mutually angular houses (1, 4, 7, 10)
        # In Equal House, we check the relative house distance
        moon_h = planet_placements["Moon"].house
        jup_h = planet_placements["Jupiter"].house
        h_diff = abs(moon_h - jup_h)
        
        # Mutual angles = houses difference is 0 (conjunct), 3 (4th house), 6 (7th house), or 9 (10th house)
        is_gaja_kesari = h_diff in [0, 3, 6, 9]
        yogas.append(AstrologyYoga(
            name="Gaja Kesari Yoga",
            description="Moon and Jupiter reside in mutually angular houses. Promotes intelligence, prosperity, and respect.",
            planets=["Moon", "Jupiter"],
            detected=is_gaja_kesari
        ))

        # 2. Budhaditya Yoga: Sun and Mercury conjunct in same sign
        sun_sign = planet_placements["Sun"].zodiac_sign
        merc_sign = planet_placements["Mercury"].zodiac_sign
        is_budhaditya = sun_sign == merc_sign
        yogas.append(AstrologyYoga(
            name="Budhaditya Yoga",
            description="Sun and Mercury are conjunct in the same zodiac sign. Enhances intellect, analytical skills, and public respect.",
            planets=["Sun", "Mercury"],
            detected=is_budhaditya
        ))

        return yogas

    def _audit_doshas(self, planet_placements: Dict[str, PlanetPosition]) -> List[AstrologyDosha]:
        """
        Audits the chart for core Vedic Doshas.
        """
        doshas = []

        # 1. Manglik Dosha: Mars in 1st, 2nd, 4th, 7th, 8th, or 12th houses from Ascendant
        mars_h = planet_placements["Mars"].house
        is_manglik = mars_h in [1, 2, 4, 7, 8, 12]
        
        doshas.append(AstrologyDosha(
            name="Manglik Dosha (Kuja Dosha)",
            detected=is_manglik,
            reason=f"Mars is situated in the {mars_h} house from the Ascendant." if is_manglik else "Mars is not in an angular or unfavorable house from Ascendant.",
            supporting_data=f"Mars House: {mars_h}, Zodiac: {planet_placements['Mars'].zodiac_sign}"
        ))

        # 2. Kaal Sarp Dosha check (Simplistic check: Rahu and Ketu divide chart)
        # For simplicity, we flag it if Rahu is in specific axis and other planets are aligned
        # Let's write a standard detection: check if all planets fall on one side of Rahu-Ketu axis
        rahu_lon = planet_placements["Rahu"].longitude
        ketu_lon = planet_placements["Ketu"].longitude
        
        # Axis bounds
        min_node = min(rahu_lon, ketu_lon)
        max_node = max(rahu_lon, ketu_lon)
        
        side_1 = 0
        side_2 = 0
        
        for name, p in planet_placements.items():
            if name in ["Rahu", "Ketu"]:
                continue
            if min_node <= p.longitude <= max_node:
                side_1 += 1
            else:
                side_2 += 1
                
        # If either side contains all 7 other planets, it is Kaal Sarp
        is_kaal_sarp = (side_1 == 7 or side_2 == 7)
        doshas.append(AstrologyDosha(
            name="Kaal Sarp Dosha",
            detected=is_kaal_sarp,
            reason="All primary planets are hemmed between Rahu and Ketu." if is_kaal_sarp else "Primary planets are distributed on both sides of the Rahu-Ketu axis.",
            supporting_data=f"Planets in hemisphere A: {side_1}, Hemisphere B: {side_2}"
        ))

        return doshas

    def generate_chart(self, details: AstrologyBirthDetails) -> AstrologyChart:
        """
        Generates the complete Vedic Astrology Chart.
        Executes geocoding resolution if required, calculates ephemeris,
        Vimshottari Dasha schedules, Yogas, and Doshas.
        """
        start_time = time.perf_counter()
        
        # 1. Resolve geocoding if coordinates are absent
        lat = details.latitude
        lon = details.longitude
        tz = details.timezone
        
        if lat is None or lon is None or not tz:
            logger.info(f"Geocoding required for place: '{details.place_of_birth}'")
            lat_res, lon_res, tz_res = geocoder.resolve_location(details.place_of_birth)
            lat = lat if lat is not None else lat_res
            lon = lon if lon is not None else lon_res
            tz = tz if tz else tz_res

        # Convert DOB/TOB (local time) to UTC for astronomical standard
        # Assume timezone offset or local time conversion
        # For simplicity, we calculate Julian Date in UTC (approximate time as UTC for JD,
        # or adjust for timezone. To be robust, we offset the birth time relative to timezone)
        # Let's perform a simple UTC offset:
        # Asia/Kolkata is UTC+05:30. Subtract 5h 30m from birth time.
        # Let's parse time and apply offset:
        # Standard timezone offsets mapping for offline simplicity:
        tz_offsets = {
            "Asia/Kolkata": 5.5,
            "Europe/London": 0.0,
            "America/New_York": -5.0,
            "Asia/Tokyo": 9.0,
            "Australia/Sydney": 10.0,
            "America/Los_Angeles": -8.0,
            "America/Toronto": -5.0
        }
        offset = tz_offsets.get(tz, 0.0) # default to UTC
        
        # Adjust time of birth by subtracting offset to get UTC
        tob_hour, tob_min = map(int, details.time_of_birth.split(":"))
        decimal_tob = tob_hour + tob_min / 60.0
        utc_tob_decimal = (decimal_tob - offset) % 24.0
        
        # If we wrapped around, adjust date
        day_offset = int((decimal_tob - offset) // 24.0)
        
        # Compute Julian Date
        jd = ephemeris_calculator.date_to_julian_date(details.date_of_birth, f"{int(utc_tob_decimal):02d}:{int((utc_tob_decimal % 1)*60):02d}")
        if day_offset != 0:
            jd += day_offset

        # 2. Calculate Ascendant (Lagna)
        ascendant_lon = self._calculate_ascendant(jd, lat, lon)
        asc_sign, _ = nakshatra_calculator.get_zodiac_sign(ascendant_lon)

        # 3. Calculate Planetary positions (Sun, Moon, Mars...)
        planet_longitudes = ephemeris_calculator.calculate_positions(jd)
        
        placements: Dict[str, PlanetPosition] = {}
        for planet, longitude in planet_longitudes.items():
            sign, deg_in_sign = nakshatra_calculator.get_zodiac_sign(longitude)
            house = self._determine_planet_house(longitude, ascendant_lon)
            nak_name, pada = nakshatra_calculator.get_nakshatra_info(longitude)
            
            placements[planet] = PlanetPosition(
                name=planet,
                longitude=round(longitude, 2),
                longitude_in_sign=round(deg_in_sign, 2),
                zodiac_sign=sign,
                house=house,
                nakshatra=nak_name,
                pada=pada,
                retrograde=False # Planets speeds can be added later
            )

        # 4. Calculate House Cusps (Equal House System)
        houses: List[HousePosition] = []
        for h in range(1, 13):
            cusp_lon = (ascendant_lon + (h - 1) * 30.0) % 360.0
            sign, _ = nakshatra_calculator.get_zodiac_sign(cusp_lon)
            # Find numerical index (1-12)
            sign_num = nakshatra_calculator.rashis.index(sign) + 1
            
            houses.append(HousePosition(
                house_number=h,
                zodiac_sign=sign,
                cusp_longitude=round(cusp_lon, 2),
                sign_number=sign_num
            ))

        # 5. Calculate Dasha timeline based on Moon's longitude
        moon_lon = planet_longitudes["Moon"]
        dasha_timeline = dasha_calculator.calculate_dasha_timeline(moon_lon, details.date_of_birth)
        pydantic_dashas = [DashaPeriod(**d) for d in dasha_timeline]

        # 6. Audit Yogas & Doshas
        yogas = self._audit_yogas(placements)
        doshas = self._audit_doshas(placements)

        calculation_time = time.perf_counter() - start_time
        logger.info(f"Chart calculated successfully in {calculation_time:.4f}s for '{details.name}'")

        return AstrologyChart(
            ascendant=asc_sign,
            ascendant_longitude=round(ascendant_lon, 2),
            planets=placements,
            houses=houses,
            dasha_timeline=pydantic_dashas,
            yogas=yogas,
            doshas=doshas,
            calculation_timestamp=datetime.now(UTC).isoformat()
        )

# Singleton instance
chart_calculator = ChartCalculator()
