from typing import List, Dict, Any
from datetime import datetime, timedelta, date

class DashaCalculator:
    """
    Vimshottari Dasha Calculator. Computes major dasha cycles (Mahadasha) and
    sub-cycles (Antardasha) based on moon's sidereal longitude.
    """
    def __init__(self):
        # Planetary order and their duration in years (total 120 years)
        self.dasha_planets = [
            "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
        ]
        self.dasha_years = {
            "Ketu": 7, "Venus": 20, "Sun": 6, "Moon": 10, "Mars": 7, 
            "Rahu": 18, "Jupiter": 16, "Saturn": 19, "Mercury": 17
        }

    def calculate_dasha_timeline(self, moon_longitude: float, dob: str) -> List[Dict[str, Any]]:
        """
        Calculates Vimshottari Dasha schedule starting from Date of Birth.
        Returns major Mahadasha/Antardasha cycles and highlights the current active period.
        """
        dob_dt = datetime.strptime(dob, "%Y-%m-%d")
        
        # 13.3333 degrees per Nakshatra
        nak_span = 360.0 / 27.0
        nak_idx = int(moon_longitude // nak_span)
        
        # Ruling planet of the Nakshatra (Ketu is index 0)
        planet_seq_idx = nak_idx % 9
        
        # Calculate balance of dasha at birth
        nak_start = nak_idx * nak_span
        elapsed_in_nak = moon_longitude - nak_start
        elapsed_fraction = elapsed_in_nak / nak_span
        remaining_fraction = 1.0 - elapsed_fraction

        # Build sequence of Mahadashas starting from the birth planet
        sequence = []
        for i in range(9):
            idx = (planet_seq_idx + i) % 9
            planet = self.dasha_planets[idx]
            duration = self.dasha_years[planet]
            sequence.append((planet, duration))

        timeline = []
        current_date = dob_dt
        
        # First Mahadasha has a remaining balance
        first_planet, total_years = sequence[0]
        rem_years = total_years * remaining_fraction
        end_date = current_date + timedelta(days=int(rem_years * 365.25))
        
        timeline.append({
            "planet": first_planet,
            "start": current_date,
            "end": end_date,
            "duration": rem_years
        })
        current_date = end_date

        # Calculate remaining 8 Mahadashas
        for planet, duration in sequence[1:]:
            end_date = current_date + timedelta(days=int(duration * 365.25))
            timeline.append({
                "planet": planet,
                "start": current_date,
                "end": end_date,
                "duration": float(duration)
            })
            current_date = end_date

        # Format timeline into Pydantic-compatible DashaPeriod dictionaries
        dasha_periods = []
        today = datetime.now()

        for period in timeline:
            mahadasha = period["planet"]
            m_start = period["start"]
            m_end = period["end"]
            
            # Simple division for Antardasha: 9 segments proportional to dasha years
            # Antardasha sequence starts from the Mahadasha planet itself
            m_idx = self.dasha_planets.index(mahadasha)
            antardasha_sequence = []
            for j in range(9):
                a_idx = (m_idx + j) % 9
                antardasha_sequence.append(self.dasha_planets[a_idx])
            
            a_start = m_start
            m_duration_days = (m_end - m_start).days
            
            for antardasha in antardasha_sequence:
                # Fraction of antardasha years
                a_years = self.dasha_years[antardasha]
                a_fraction = a_years / 120.0 # Vimshottari total is 120
                a_duration_days = int(m_duration_days * a_fraction)
                
                a_end = a_start + timedelta(days=a_duration_days)
                if a_end > m_end:
                    a_end = m_end
                    
                is_current = (a_start <= today <= a_end)
                
                dasha_periods.append({
                    "mahadasha": mahadasha,
                    "antardasha": antardasha,
                    "start_date": a_start.strftime("%Y-%m-%d"),
                    "end_date": a_end.strftime("%Y-%m-%d"),
                    "current": is_current
                })
                
                a_start = a_end

        # Safety check: if none is marked current, mark the closest one
        has_current = any(d["current"] for d in dasha_periods)
        if not has_current and dasha_periods:
            # Mark the one covering current date or nearest past
            for d in dasha_periods:
                # Try to find the closest active interval
                d_start = datetime.strptime(d["start_date"], "%Y-%m-%d")
                d_end = datetime.strptime(d["end_date"], "%Y-%m-%d")
                if d_start <= today <= d_end:
                    d["current"] = True
                    break

        return dasha_periods

# Singleton instance
dasha_calculator = DashaCalculator()
