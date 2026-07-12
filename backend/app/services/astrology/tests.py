import pytest
import json
from fastapi.testclient import TestClient
from app.main import app
from app.services.astrology.schemas import AstrologyBirthDetails, AstrologyChart
from app.services.astrology.chart import chart_calculator
from app.services.astrology.ephemeris import ephemeris_calculator
from app.services.astrology.nakshatra import nakshatra_calculator
from app.services.astrology.dasha import dasha_calculator
from app.services.astrology.prompt_builder import astrology_prompt_builder
from unittest.mock import AsyncMock, patch

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_astrology_birth_details_validation():
    """
    Assert Pydantic checks capture incorrect dob, tob, lat, and lon.
    """
    # Case 1: Future DOB
    with pytest.raises(ValueError):
        AstrologyBirthDetails(
            name="Rahul",
            date_of_birth="2050-01-01", # Future
            time_of_birth="10:00",
            place_of_birth="Delhi"
        )
        
    # Case 2: Impossible TOB hours
    with pytest.raises(ValueError):
        AstrologyBirthDetails(
            name="Rahul",
            date_of_birth="1990-01-01",
            time_of_birth="25:10", # Invalid hour
            place_of_birth="Delhi"
        )

    # Case 3: Out of bound Latitude
    with pytest.raises(ValueError):
        AstrologyBirthDetails(
            name="Rahul",
            date_of_birth="1990-01-01",
            time_of_birth="10:00",
            place_of_birth="Delhi",
            latitude=95.0 # Out of bounds
        )

def test_julian_date_calculation():
    """
    Verify conversion of calendar values to correct astronomical Julian dates.
    """
    jd = ephemeris_calculator.date_to_julian_date("2000-01-01", "12:00")
    # Julian Date for J2000.0 epoch is exactly 2451545.0
    assert abs(jd - 2451545.0) < 0.01

def test_ayanamsha_offset():
    """
    Assert Ayanamsha offset returns correct value for J2000 epoch (~23.85 degrees).
    """
    jd = 2451545.0 # J2000
    aya = ephemeris_calculator.get_ayanamsha(jd)
    assert abs(aya - 23.85) < 0.05

def test_nakshatra_pada_assignment():
    """
    Assert absolute degrees are correctly mapped to Nakshatras and Padas.
    """
    # 0 degrees absolute longitude should map to Ashwini Nakshatra, Pada 1
    nak, pada = nakshatra_calculator.get_nakshatra_info(0.0)
    assert nak == "Ashwini"
    assert pada == 1

    # 13.5 degrees absolute longitude should map to Ashwini Pada 4 or Bharani Pada 1
    # 13° 20' is 13.3333 degrees. So 13.5 is in Bharani Pada 1
    nak2, pada2 = nakshatra_calculator.get_nakshatra_info(13.5)
    assert nak2 == "Bharani"
    assert pada2 == 1

def test_dasha_periods_timeline():
    """
    Verify Vimshottari dasha outputs timeline with correct current flags.
    """
    moon_lon = 125.45 # absolute Moon longitude (in Leo)
    dob = "1995-08-15"
    timeline = dasha_calculator.calculate_dasha_timeline(moon_lon, dob)
    
    assert len(timeline) > 0
    # Confirm it generates multiple intervals
    assert "mahadasha" in timeline[0]
    assert "antardasha" in timeline[0]
    # Check that at least one period is flagged current
    assert any(d["current"] for d in timeline)

def test_chart_calculation_orchestration():
    """
    Verify orchestrator returns clean AstrologyChart pydantic structure.
    """
    details = AstrologyBirthDetails(
        name="Rahul Verma",
        date_of_birth="1990-05-15",
        time_of_birth="10:00",
        place_of_birth="New Delhi, India" # Will geocode using offline registry
    )
    chart = chart_calculator.generate_chart(details)
    
    assert isinstance(chart, AstrologyChart)
    assert "Moon" in chart.planets
    assert len(chart.houses) == 12
    assert len(chart.yogas) > 0
    assert len(chart.doshas) > 0

def test_prompt_builder_formatting():
    """
    Verify prompt builder correctly formats calculations into text prompt.
    """
    details = AstrologyBirthDetails(
        name="Test",
        date_of_birth="1990-05-15",
        time_of_birth="10:00",
        place_of_birth="London"
    )
    chart = chart_calculator.generate_chart(details)
    prompt = astrology_prompt_builder.build_astrology_user_prompt(chart, "Will I buy a house?", [])
    
    assert "### COMPUTED CHART DETAILS" in prompt
    assert "Active & Upcoming Vimshottari Dasha Periods:" in prompt
    assert "Will I buy a house?" in prompt

def test_api_chart_endpoint(client: TestClient):
    """
    Verify POST /api/chart returns complete chart payload.
    """
    payload = {
        "name": "Rahul Verma",
        "date_of_birth": "1990-05-15",
        "time_of_birth": "10:00",
        "place_of_birth": "New Delhi, India"
      }
    response = client.post("/api/chart", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "ascendant" in data
    assert "planets" in data
    assert "houses" in data

def test_api_chart_summary_endpoint(client: TestClient):
    """
    Verify POST /api/chart-summary compiles statistics.
    """
    # First generate a chart
    details = AstrologyBirthDetails(
        name="Rahul Verma",
        date_of_birth="1990-05-15",
        time_of_birth="10:00",
        place_of_birth="New Delhi, India"
    )
    chart = chart_calculator.generate_chart(details)
    
    response = client.post("/api/chart-summary", json=chart.model_dump())
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "moonSign" in data
    assert "currentDasha" in data

@pytest.mark.asyncio
async def test_api_interpret_endpoint(client: TestClient):
    """
    Verify POST /api/interpret queries mock Gemini and outputs warning-compliant disclaimers.
    """
    details = AstrologyBirthDetails(
        name="Rahul",
        date_of_birth="1990-05-15",
        time_of_birth="10:00",
        place_of_birth="Mumbai"
    )
    chart = chart_calculator.generate_chart(details)
    
    payload = {
        "chart": chart.model_dump(),
        "question": "What does Saturn say about my job?",
        "history": []
    }
    
    mock_reply = "Saturn is placed in your 5th house. You will learn work discipline."
    mock_response = AsyncMock()
    mock_response.text = mock_reply
    
    with patch("google.generativeai.GenerativeModel.generate_content_async", return_value=mock_response):
        response = client.post("/api/interpret", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "timestamp" in data
        # Check that disclaimer is appended automatically by safety filters
        assert "Reminder:" in data["reply"]
