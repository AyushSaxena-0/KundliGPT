from typing import List, Dict, Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
import re

class AstrologyBirthDetails(BaseModel):
    """
    Input schema for astronomical calculations.
    Requires exact geolocations and timezones.
    """
    name: str = Field(..., description="Name of the person", example="Aarav Sharma")
    gender: Optional[str] = Field(None, description="Gender of the person", example="Male")
    date_of_birth: str = Field(..., description="Date of birth in YYYY-MM-DD format", example="1995-08-15")
    time_of_birth: str = Field(..., description="Time of birth in HH:MM (24-hour) format", example="14:30")
    place_of_birth: str = Field(..., description="City/Location of birth", example="New Delhi, India")
    latitude: Optional[float] = Field(None, description="Latitude of birth place (-90.0 to 90.0)", example=28.6139)
    longitude: Optional[float] = Field(None, description="Longitude of birth place (-180.0 to 180.0)", example=77.2090)
    timezone: Optional[str] = Field(None, description="Timezone name (e.g. Asia/Kolkata)", example="Asia/Kolkata")

    @field_validator("date_of_birth")
    @classmethod
    def validate_dob(cls, value: str) -> str:
        stripped = value.strip()
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", stripped):
            raise ValueError("date_of_birth must be in YYYY-MM-DD format.")
        try:
            parsed = datetime.strptime(stripped, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Invalid calendar date.")
        if parsed > date.today():
            raise ValueError("date_of_birth cannot be in the future.")
        return stripped

    @field_validator("time_of_birth")
    @classmethod
    def validate_tob(cls, value: str) -> str:
        stripped = value.strip()
        if not re.match(r"^(?:[01]\d|2[0-3]):[0-5]\d$", stripped):
            raise ValueError("time_of_birth must be in HH:MM 24-hour format.")
        return stripped

    @field_validator("latitude")
    @classmethod
    def validate_lat(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and (value < -90.0 or value > 90.0):
            raise ValueError("Latitude must be between -90.0 and 90.0.")
        return value

    @field_validator("longitude")
    @classmethod
    def validate_lon(cls, value: Optional[float]) -> Optional[float]:
        if value is not None and (value < -180.0 or value > 180.0):
            raise ValueError("Longitude must be between -180.0 and 180.0.")
        return value

class PlanetPosition(BaseModel):
    """
    Astrological values computed for a specific planet.
    """
    name: str = Field(..., description="Name of the planet (Sun, Moon, Mars...)", example="Moon")
    longitude: float = Field(..., description="Total degrees in longitude (0-360)", example=145.62)
    longitude_in_sign: float = Field(..., description="Degrees within the zodiac sign (0-30)", example=25.62)
    zodiac_sign: str = Field(..., description="Name of the Zodiac Sign", example="Leo")
    house: int = Field(..., description="House assignment in chart (1-12)", example=5)
    nakshatra: str = Field(..., description="Ruling Nakshatra name", example="Purva Phalguni")
    pada: int = Field(..., description="Pada sub-division (1-4)", example=4)
    retrograde: bool = Field(False, description="Is the planet in retrograde motion?")

class HousePosition(BaseModel):
    """
    Configuration computed for a chart house (Bhava).
    """
    house_number: int = Field(..., description="House index (1-12)", example=1)
    zodiac_sign: str = Field(..., description="Zodiac sign on the cusp of this house", example="Aries")
    cusp_longitude: float = Field(..., description="Absolute longitude degree of the cusp (0-360)", example=12.45)
    sign_number: int = Field(..., description="Numerical zodiac index (1-12)", example=1)

class DashaPeriod(BaseModel):
    """
    Calculated Vimshottari Dasha period.
    """
    mahadasha: str = Field(..., description="Ruling planet of the major dasha period", example="Jupiter")
    antardasha: str = Field(..., description="Ruling planet of the sub-dasha period", example="Saturn")
    start_date: str = Field(..., description="ISO 8601 start date of this dasha", example="2024-05-10")
    end_date: str = Field(..., description="ISO 8601 end date of this dasha", example="2026-11-16")
    current: bool = Field(..., description="Is this period active currently?")

class AstrologyYoga(BaseModel):
    """
    Calculated yoga (auspicious/inauspicious planetary combination).
    """
    name: str = Field(..., description="Name of the Yoga", example="Gaja Kesari Yoga")
    description: str = Field(..., description="Detailed description of the yoga effects", example="Moon and Jupiter in mutually angular houses.")
    planets: List[str] = Field(..., description="Planets forming this combination", example=["Moon", "Jupiter"])
    detected: bool = Field(..., description="Is this yoga present in the chart?")

class AstrologyDosha(BaseModel):
    """
    Calculated astrological dosha (planetary blemish).
    """
    name: str = Field(..., description="Name of the Dosha", example="Manglik Dosha")
    detected: bool = Field(..., description="Is this dosha present?", example=True)
    reason: str = Field(..., description="Calculation explanation", example="Mars is in the 8th house from Ascendant.")
    supporting_data: str = Field(..., description="Supporting positions data string", example="Mars in Scorpio in 8th house")

class AstrologyChart(BaseModel):
    """
    Complete structured Vedic chart (Kundli) JSON payload.
    """
    ascendant: str = Field(..., description="Lagna / Ascendant zodiac sign", example="Leo")
    ascendant_longitude: float = Field(..., description="Absolute longitude degree of Lagna", example=120.45)
    planets: Dict[str, PlanetPosition] = Field(..., description="Computed planetary placements")
    houses: List[HousePosition] = Field(..., description="Computed house configurations")
    dasha_timeline: List[DashaPeriod] = Field(..., description="Calculated Vimshottari dasha schedule")
    yogas: List[AstrologyYoga] = Field(..., description="List of audited yogas")
    doshas: List[AstrologyDosha] = Field(..., description="List of audited doshas")
    calculation_timestamp: str = Field(..., description="ISO timestamp of calculations")
