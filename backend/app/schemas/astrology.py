from typing import Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, date
import re

class BirthDetails(BaseModel):
    """
    Schema representing user's birth details for Vedic astrology calculations.
    All fields are optional/nullable until collected during the chat.
    """
    name: Optional[str] = Field(None, description="Name of the person", example="Aarav Sharma")
    gender: Optional[str] = Field(None, description="Gender (e.g., Male, Female, Other)", example="Male")
    date_of_birth: Optional[str] = Field(None, description="Date of birth in YYYY-MM-DD format", example="1995-08-15")
    time_of_birth: Optional[str] = Field(None, description="Time of birth in HH:MM (24-hour) format", example="14:30")
    place_of_birth: Optional[str] = Field(None, description="Place of birth (City, State, Country)", example="New Delhi, India")
    timezone: Optional[str] = Field(None, description="Timezone name or UTC offset", example="Asia/Kolkata")

    @field_validator("name", "gender", "place_of_birth", "timezone")
    @classmethod
    def validate_non_empty_strings(cls, value: Optional[str]) -> Optional[str]:
        if value is not None:
            stripped = value.strip()
            if not stripped:
                raise ValueError("Field cannot be an empty string.")
            return stripped
        return value

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        
        stripped = value.strip()
        if not stripped:
            raise ValueError("Date of birth cannot be an empty string.")

        # Match YYYY-MM-DD
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", stripped):
            raise ValueError("Date of birth must be in YYYY-MM-DD format.")

        try:
            parsed_date = datetime.strptime(stripped, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Invalid calendar date. Please enter a valid date.")

        # Ensure birth date is not in the future
        if parsed_date > date.today():
            raise ValueError("Date of birth cannot be in the future.")

        return stripped

    @field_validator("time_of_birth")
    @classmethod
    def validate_time_of_birth(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        stripped = value.strip()
        if not stripped:
            raise ValueError("Time of birth cannot be an empty string.")

        # Match HH:MM (24-hour)
        if not re.match(r"^(?:[01]\d|2[0-3]):[0-5]\d$", stripped):
            raise ValueError("Time of birth must be in HH:MM (24-hour) format.")

        return stripped
