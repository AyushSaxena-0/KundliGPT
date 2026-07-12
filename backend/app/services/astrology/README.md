# Vedic Astrology Calculation Engine Module

This directory contains the independent, modular **Vedic Astrology Calculation Engine** service. It is designed to function separately from the AI conversation pipeline so that it can be reused by future features (such as compatibility matching, daily horoscopes, festival calendars, and mobile app APIs).

---

## Module Architecture

Every module in this package maintains a single, decoupled responsibility:

```text
app/services/astrology/
├── schemas.py           # Pydantic schemas validating all inputs/outputs (Chart, Planet, Dasha)
├── geocoder.py          # Session-cached geocoding resolver (City -> Lat/Lon/Timezone)
├── ephemeris.py         # Keplerian geocentric orbital calculators for Sidereal planet degrees
├── nakshatra.py         # Converts longitudinal degrees to Nakshatras and Padas
├── dasha.py             # Vimshottari Mahadasha/Antardasha schedule calculators
├── chart.py             # Main orchestrator (builds houses, audits Yogas & Doshas)
├── prompt_builder.py    # AstrologyPromptBuilder mapping structured chart facts to AI
├── routes.py            # API routes (/api/chart, /api/interpret, /api/chart-summary)
├── test_astrology.py    # Unit & API integration test cases
└── README.md            # This documentation
```

---

## Calculation Pipeline

When a client requests a chart via `/api/chart`:

1. **Input Validation**: Birth details are audited by the `AstrologyBirthDetails` Pydantic model (checks calendar limits, 24-hr formats, and coordinates coordinates).
2. **Geocoding Resolution**: If coordinates or timezones are absent, `geocoder.py` resolves the city name (utilizing session cache and offline major-city registries).
3. **UTC Conversion & Julian Date**: Local birth time is adjusted to UTC by timezone offsets, then converted to an astronomical Julian Date (JD).
4. **Planetary Placements**: `ephemeris.py` calculates geocentric coordinates based on Keplerian orbital elements at the JD. The tropical degrees are converted to **Sidereal Longitude (Lahiri Ayanamsha)**.
5. **Chart Divisions**:
   - **Lagna (Ascendant)** is computed from local Sidereal Time and latitude.
   - **Houses** are assigned using the **Equal House System** from the Lagna cusp.
   - **Nakshatras & Padas** are resolved (27 mansions spanning 13°20' each).
6. **Vimshottari Dasha**: The Moon's longitude calculates the starting dasha balance at birth, laying out the timeline of Mahadashas and Antardashas.
7. **Yogas & Doshas**: The chart is audited for combinations (like *Gaja Kesari Yoga*, *Budhaditya Yoga*, *Manglik Dosha*, and *Kaal Sarp Dosha*).
8. **JSON Serialization**: Returns the complete validated `AstrologyChart` payload.

---

## API Endpoints

### 1. `POST /api/chart`
Calculates and returns complete chart JSON coordinates.
* **Request:** `AstrologyBirthDetails`
* **Response:** `AstrologyChart`

### 2. `POST /api/interpret`
Fires an AI-interpretation request using the prompt builder.
* **Request:**
  ```json
  {
    "chart": { ... },
    "question": "Will my career improve in the upcoming Jupiter Dasha?",
    "history": []
  }
  ```
* **Response:**
  ```json
  {
    "reply": "## Interpretation\n\nYour 10th house is governed by...",
    "timestamp": "2026-07-11T23:29:12Z"
  }
  ```

### 3. `POST /api/chart-summary`
Returns a highly optimized, concise summary of placements, avoiding recalculation costs.
* **Request:** `AstrologyChart`
* **Response:**
  ```json
  {
    "summary": "Vedic chart calculated. Ascendant is in Leo, Moon Sign in Scorpio. Active Vimshottari period: Jupiter-Saturn. Yogas: Budhaditya Yoga.",
    "ascendant": "Leo",
    "moonSign": "Scorpio",
    "currentDasha": "Jupiter-Saturn"
  }
  ```

---

## Extension Points & Future Compatibility

1. **Kundli Matching**: Create an independent matching route that accepts two `AstrologyChart` payloads and computes the Ashta Koota compatibilities.
2. **Transit Audits**: Compare a static `AstrologyChart` against a real-time `jd = now()` planetary calculator to identify active transits.
3. **Database Integration**: Save computed `AstrologyChart` JSONs under user accounts (e.g. PostgreSQL or Supabase) to avoid recalculations.
