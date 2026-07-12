import math
from datetime import datetime, UTC
from typing import Dict, Tuple, Any

class EphemerisCalculator:
    """
    Utility class to calculate planetary sidereal longitudes (Lahiri Ayanamsha)
    using Keplerian orbital elements and geocentric conversions.
    """
    def __init__(self):
        # Semi-major axis (AU), Eccentricity, Inclination (deg), Mean Longitude (deg),
        # Longitude of perihelion (deg), Longitude of ascending node (deg)
        # Values are parameterized for J2000 (Jan 1, 2000 12:00 UTC)
        # Rates are per Julian Century (36525 days)
        self.orbital_elements = {
            "Sun": { # Represented by Earth's orbit elements inverted
                "a": 1.00000261, "e": 0.01671123, "i": 0.0, "L": 280.46645, "w": 282.93734, "node": 0.0,
                "da": 0.00000005, "de": -0.00003661, "di": 0.0, "dL": 36000.76983, "dw": 0.03176, "dnode": 0.0
            },
            "Mercury": {
                "a": 0.38709893, "e": 0.20563069, "i": 7.00487, "L": 252.25084, "w": 77.45645, "node": 48.33167,
                "da": 0.0, "de": 0.00002040, "di": -0.00594, "dL": 149472.67411, "dw": 0.15901, "dnode": -0.12534
            },
            "Venus": {
                "a": 0.72333199, "e": 0.00677323, "i": 3.39471, "L": 181.97973, "w": 131.53298, "node": 76.68069,
                "da": 0.0, "de": -0.00004776, "di": -0.00079, "dL": 58517.81538, "dw": 0.00213, "dnode": -0.27769
            },
            "Mars": {
                "a": 1.52371034, "e": 0.09341233, "i": 1.85061, "L": 355.45332, "w": 336.04084, "node": 49.57854,
                "da": 0.00001847, "de": 0.00011902, "di": -0.00724, "dL": 19140.30268, "dw": 0.44388, "dnode": -0.29498
            },
            "Jupiter": {
                "a": 5.20288700, "e": 0.04838624, "i": 1.30440, "L": 34.40438, "w": 14.72847, "node": 100.47392,
                "da": -0.00011607, "de": -0.00016539, "di": -0.00415, "dL": 3034.74612, "dw": 0.19152, "dnode": 0.20469
            },
            "Saturn": {
                "a": 9.53667594, "e": 0.05415060, "i": 2.48446, "L": 49.94432, "w": 92.43194, "node": 113.66242,
                "da": -0.00125060, "de": -0.00036762, "di": 0.00193, "dL": 1222.11379, "dw": -0.41897, "dnode": -0.28867
            }
        }

    def date_to_julian_date(self, dob: str, tob: str) -> float:
        """
        Converts calendar date and time (UTC) to Julian Date.
        """
        dt = datetime.strptime(f"{dob} {tob}", "%Y-%m-%d %H:%M")
        
        # Calculate Julian Date formula
        y = dt.year
        m = dt.month
        d = dt.day + (dt.hour + dt.minute / 60.0) / 24.0
        
        if m <= 2:
            y -= 1
            m += 12
            
        A = math.floor(y / 100)
        B = 2 - A + math.floor(A / 4)
        
        jd = math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1)) + d + B - 1524.5
        return jd

    def get_ayanamsha(self, jd: float) -> float:
        """
        Calculates Lahiri Ayanamsha offset (precession correction) for Julian Date.
        Approx 23.85 degrees in 2000.
        """
        # Julian centuries since J2000.0
        t = (jd - 2451545.0) / 36525.0
        # Lahiri formula approximation
        return 23.85 + (t * 50.2784 / 3600.0)

    def calculate_positions(self, jd: float) -> Dict[str, float]:
        """
        Calculates geocentric longitudes for Sun, Moon, and major planets.
        Converts heliocentric coordinates, translates relative to Earth,
        and applies Ayanamsha to get Sidereal Longitude.
        """
        t = (jd - 2451545.0) / 36525.0
        ayanamsha = self.get_ayanamsha(jd)
        
        # 1. Earth's Heliocentric coordinates (needed to compute geocentric offsets)
        earth_elements = self._get_elements_at_epoch("Sun", t)
        ex, ey, ez = self._elements_to_heliocentric(earth_elements)

        positions: Dict[str, float] = {}

        # 2. Calculate Planets (Mercury, Venus, Mars, Jupiter, Saturn)
        for planet, el in self.orbital_elements.items():
            if planet == "Sun":
                # Sun is geocentrically opposite to Earth's heliocentric position
                solar_lon = (earth_elements["L"] + 180.0) % 360.0
                positions["Sun"] = (solar_lon - ayanamsha) % 360.0
                continue
                
            p_el = self._get_elements_at_epoch(planet, t)
            px, py, pz = self._elements_to_heliocentric(p_el)
            
            # Geocentric coordinates = planet - earth
            gx = px - ex
            gy = py - ey
            gz = pz - ez
            
            # Calculate geocentric longitude
            tropical_lon = math.degrees(math.atan2(gy, gx)) % 360.0
            positions[planet] = (tropical_lon - ayanamsha) % 360.0

        # 3. Moon Positions (Requires custom simplified lunar orbit equations)
        # Moon orbits Earth directly; mean longitude and anomaly are calculated relative to J2000
        l_moon = (218.316 + 481267.881 * t) % 360.0
        d_moon = (297.850 + 445267.111 * t) % 360.0 # Mean elongation
        m_moon = (357.529 + 35999.050 * t) % 360.0  # Sun's anomaly
        m_prime = (134.963 + 477198.867 * t) % 360.0 # Moon's anomaly
        f_moon = (93.272 + 483202.018 * t) % 360.0  # Moon's latitude parameter

        # Lunar perturbation equations (simplified)
        moon_tropical = l_moon + 6.289 * math.sin(math.radians(m_prime)) \
                                 - 1.274 * math.sin(math.radians(m_prime - 2 * d_moon)) \
                                 + 0.658 * math.sin(math.radians(2 * d_moon)) \
                                 + 0.214 * math.sin(math.radians(2 * m_prime)) \
                                 - 0.186 * math.sin(math.radians(m_moon))
        positions["Moon"] = (moon_tropical - ayanamsha) % 360.0

        # 4. Calculate Rahu & Ketu (Lunar Nodes)
        # Rahu is the ascending lunar node, Ketu is 180 degrees opposite
        # Mean Node formula
        omega_node = (125.04452 - 1934.136261 * t) % 360.0
        positions["Rahu"] = (omega_node - ayanamsha) % 360.0
        positions["Ketu"] = (positions["Rahu"] + 180.0) % 360.0

        return positions

    def _get_elements_at_epoch(self, planet: str, t: float) -> Dict[str, float]:
        """
        Computes the orbital elements of a planet at century time 't'.
        """
        el = self.orbital_elements[planet]
        return {
            "a": el["a"] + el["da"] * t,
            "e": el["e"] + el["de"] * t,
            "i": el["i"] + el["di"] * t,
            "L": el["L"] + el["dL"] * t,
            "w": el["w"] + el["dw"] * t,
            "node": el["node"] + el["dnode"] * t
        }

    def _elements_to_heliocentric(self, el: Dict[str, float]) -> Tuple[float, float, float]:
        """
        Converts Keplerian elements to Heliocentric 3D coordinate vectors.
        """
        a = el["a"]
        e = el["e"]
        i = math.radians(el["i"])
        L = math.radians(el["L"])
        w = math.radians(el["w"])
        node = math.radians(el["node"])
        
        # Mean anomaly
        M = L - w
        # Solve Kepler's equation for Eccentric Anomaly E
        # E = M + e*sin(E). Approximate using iteration
        E = M
        for _ in range(5):
            E = M + e * math.sin(E)
            
        # Coordinates in orbital plane
        x_orb = a * (math.cos(E) - e)
        y_orb = a * math.sqrt(1.0 - e*e) * math.sin(E)
        
        # Argument of perihelion
        w_prime = w - node
        
        # Transform to ecliptic 3D coordinates
        cos_node, sin_node = math.cos(node), math.sin(node)
        cos_w, sin_w = math.cos(w_prime), math.sin(w_prime)
        cos_i, sin_i = math.cos(i), math.sin(i)
        
        x = x_orb * (cos_node * cos_w - sin_node * sin_w * cos_i) - y_orb * (cos_node * sin_w + sin_node * cos_w * cos_i)
        y = x_orb * (sin_node * cos_w + cos_node * sin_w * cos_i) - y_orb * (sin_w * sin_node - cos_node * cos_w * cos_i)
        z = x_orb * (sin_w * sin_i) + y_orb * (cos_w * sin_i)
        
        return x, y, z

# Singleton instance
ephemeris_calculator = EphemerisCalculator()
