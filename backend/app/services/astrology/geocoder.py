import logging
from typing import Dict, Any, Tuple, Optional

logger = logging.getLogger("app.services.astrology.geocoder")

class Geocoder:
    """
    Service responsible for resolving place names into coordinates (Lat/Lon)
    and timezones. Incorporates session caching to optimize API performance.
    """
    def __init__(self):
        # In-memory session cache for geocoded locations
        self._cache: Dict[str, Dict[str, Any]] = {}
        
        # Local fallback registry of major global cities for offline reliability
        self._registry: Dict[str, Dict[str, Any]] = {
            "new delhi": {"lat": 28.6139, "lon": 77.2090, "tz": "Asia/Kolkata"},
            "delhi": {"lat": 28.6139, "lon": 77.2090, "tz": "Asia/Kolkata"},
            "mumbai": {"lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata"},
            "bombay": {"lat": 19.0760, "lon": 72.8777, "tz": "Asia/Kolkata"},
            "bangalore": {"lat": 12.9716, "lon": 77.5946, "tz": "Asia/Kolkata"},
            "bengaluru": {"lat": 12.9716, "lon": 77.5946, "tz": "Asia/Kolkata"},
            "london": {"lat": 51.5074, "lon": -0.1278, "tz": "Europe/London"},
            "new york": {"lat": 40.7128, "lon": -74.0060, "tz": "America/New_York"},
            "tokyo": {"lat": 35.6762, "lon": 139.6503, "tz": "Asia/Tokyo"},
            "sydney": {"lat": -33.8688, "lon": 151.2093, "tz": "Australia/Sydney"},
            "san francisco": {"lat": 37.7749, "lon": -122.4194, "tz": "America/Los_Angeles"},
            "toronto": {"lat": 43.6532, "lon": -79.3832, "tz": "America/Toronto"}
        }

    def resolve_location(self, place_name: str) -> Tuple[float, float, str]:
        """
        Resolves location name to (Latitude, Longitude, Timezone).
        Checks cache first, then registry, falling back to New Delhi if unknown.
        """
        clean_name = place_name.strip().lower()
        
        # 1. Check in-memory session cache
        if clean_name in self._cache:
            cached = self._cache[clean_name]
            logger.info(f"Geocoding cache hit for location: '{place_name}'")
            return cached["lat"], cached["lon"], cached["tz"]
            
        # 2. Check local offline registry
        # Try exact or partial matches
        matched_coords = None
        for key, val in self._registry.items():
            if key in clean_name or clean_name in key:
                matched_coords = val
                break
                
        if matched_coords:
            lat, lon, tz = matched_coords["lat"], matched_coords["lon"], matched_coords["tz"]
            logger.info(f"Offline registry match found for location '{place_name}' -> ({lat}, {lon})")
        else:
            # 3. Safe fallback coordinate if location is unknown
            lat, lon, tz = 28.6139, 77.2090, "Asia/Kolkata" # New Delhi
            logger.warning(
                f"Location '{place_name}' not in local geocoding registry. "
                f"Utilizing default fallback (New Delhi: {lat}, {lon})"
            )

        # Cache resolved values
        self._cache[clean_name] = {"lat": lat, "lon": lon, "tz": tz}
        return lat, lon, tz

# Singleton instance
geocoder = Geocoder()
