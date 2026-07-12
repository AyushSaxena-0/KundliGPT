import os
import json
import logging
import httpx
from datetime import datetime, UTC, timedelta
from typing import Dict, Any, List, Optional
from app.config.config import settings

logger = logging.getLogger("app.services.database")

class DatabaseService:
    """
    Unified Database service. Connects directly to Supabase REST endpoints (PostgREST)
    if configured, otherwise falls back gracefully to a file-based JSON store for local offline testing.
    """
    def __init__(self):
        self.url = settings.SUPABASE_URL.rstrip('/')
        self.key = settings.SUPABASE_KEY
        self.use_supabase = bool(self.url and self.key)
        
        # Local fallback store files
        self.local_dir = "local_db"
        if not self.use_supabase:
            logger.info("Supabase credentials missing. Booting in local file-based database fallback mode.")
            os.makedirs(self.local_dir, exist_ok=True)
            self._init_local_files()
        else:
            logger.info(f"Supabase database integration enabled for: {self.url}")
            self.headers = {
                "apikey": self.key,
                "Authorization": f"Bearer {self.key}",
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            }

    def _init_local_files(self):
        """Initializes mock tables locally as JSON lists."""
        tables = ["profiles", "saved_birth_details", "conversations", "messages", "feedback", "saved_charts", "usage"]
        for table in tables:
            path = os.path.join(self.local_dir, f"{table}.json")
            if not os.path.exists(path):
                with open(path, "w") as f:
                    json.dump([], f)

    def _read_local(self, table: str) -> List[Dict[str, Any]]:
        path = os.path.join(self.local_dir, f"{table}.json")
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception:
            return []

    def _write_local(self, table: str, data: List[Dict[str, Any]]):
        path = os.path.join(self.local_dir, f"{table}.json")
        with open(path, "w") as f:
            json.dump(data, f, indent=2)

    # ------------------ USERS / PROFILES ------------------
    async def create_profile(self, user_id: str, name: str, email: str, is_admin: bool = False) -> Dict[str, Any]:
        payload = {
            "id": user_id,
            "name": name,
            "email": email,
            "is_admin": is_admin,
            "premium_tier": "free",
            "created_at": datetime.now(UTC).isoformat(),
            "updated_at": datetime.now(UTC).isoformat()
        }
        
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.post(f"{self.url}/rest/v1/profiles", json=payload, headers=self.headers)
                if res.status_code >= 400:
                    logger.error(f"Supabase profiles insert failed: {res.text}")
                    raise Exception(f"DB Error: {res.text}")
                return res.json()[0]
        else:
            db = self._read_local("profiles")
            # Avoid duplicate inserts
            existing = next((u for u in db if u["id"] == user_id), None)
            if existing:
                return existing
            db.append(payload)
            self._write_local("profiles", db)
            return payload

    async def get_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.get(f"{self.url}/rest/v1/profiles?id=eq.{user_id}", headers=self.headers)
                data = res.json()
                return data[0] if data else None
        else:
            db = self._read_local("profiles")
            return next((u for u in db if u["id"] == user_id and not u.get("deleted_at")), None)

    async def update_profile(self, user_id: str, name: str) -> Optional[Dict[str, Any]]:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.patch(
                    f"{self.url}/rest/v1/profiles?id=eq.{user_id}",
                    json={"name": name, "updated_at": datetime.now(UTC).isoformat()},
                    headers=self.headers
                )
                data = res.json()
                return data[0] if data else None
        else:
            db = self._read_local("profiles")
            for u in db:
                if u["id"] == user_id:
                    u["name"] = name
                    u["updated_at"] = datetime.now(UTC).isoformat()
                    self._write_local("profiles", db)
                    return u
            return None

    # ------------------ SAVED BIRTH DETAILS ------------------
    async def save_birth_details(self, user_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        import uuid
        record = {
            "id": payload.get("id") or str(uuid.uuid4()),
            "user_id": user_id,
            "label": payload["label"],
            "name": payload["name"],
            "gender": payload.get("gender"),
            "date_of_birth": payload["date_of_birth"],
            "time_of_birth": payload["time_of_birth"],
            "place_of_birth": payload["place_of_birth"],
            "latitude": payload.get("latitude"),
            "longitude": payload.get("longitude"),
            "timezone": payload.get("timezone"),
            "created_at": datetime.now(UTC).isoformat(),
            "updated_at": datetime.now(UTC).isoformat()
        }
        
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.post(f"{self.url}/rest/v1/saved_birth_details", json=record, headers=self.headers)
                return res.json()[0]
        else:
            db = self._read_local("saved_birth_details")
            # Overwrite if exists, else append
            db = [r for r in db if r["id"] != record["id"]]
            db.append(record)
            self._write_local("saved_birth_details", db)
            return record

    async def get_saved_birth_details(self, user_id: str) -> List[Dict[str, Any]]:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.get(f"{self.url}/rest/v1/saved_birth_details?user_id=eq.{user_id}&deleted_at=is.null", headers=self.headers)
                return res.json()
        else:
            db = self._read_local("saved_birth_details")
            return [r for r in db if r["user_id"] == user_id and not r.get("deleted_at")]

    async def delete_birth_details(self, record_id: str, user_id: str) -> bool:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.patch(
                    f"{self.url}/rest/v1/saved_birth_details?id=eq.{record_id}&user_id=eq.{user_id}",
                    json={"deleted_at": datetime.now(UTC).isoformat()},
                    headers=self.headers
                )
                return res.status_code < 400
        else:
            db = self._read_local("saved_birth_details")
            for r in db:
                if r["id"] == record_id and r["user_id"] == user_id:
                    r["deleted_at"] = datetime.now(UTC).isoformat()
                    self._write_local("saved_birth_details", db)
                    return True
            return False

    # ------------------ CONVERSATIONS & MESSAGES ------------------
    async def create_conversation(self, user_id: str, title: str = "New Consultation", chart_summary: Optional[str] = None) -> Dict[str, Any]:
        import uuid
        conv = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "title": title,
            "chart_summary": chart_summary,
            "created_at": datetime.now(UTC).isoformat(),
            "updated_at": datetime.now(UTC).isoformat()
        }
        
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.post(f"{self.url}/rest/v1/conversations", json=conv, headers=self.headers)
                return res.json()[0]
        else:
            db = self._read_local("conversations")
            db.append(conv)
            self._write_local("conversations", db)
            return conv

    async def get_conversations(self, user_id: str) -> List[Dict[str, Any]]:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.get(f"{self.url}/rest/v1/conversations?user_id=eq.{user_id}&deleted_at=is.null&order=updated_at.desc", headers=self.headers)
                return res.json()
        else:
            db = self._read_local("conversations")
            filtered = [c for c in db if c["user_id"] == user_id and not c.get("deleted_at")]
            return sorted(filtered, key=lambda x: x["updated_at"], reverse=True)

    async def rename_conversation(self, conv_id: str, user_id: str, title: str) -> Optional[Dict[str, Any]]:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.patch(
                    f"{self.url}/rest/v1/conversations?id=eq.{conv_id}&user_id=eq.{user_id}",
                    json={"title": title, "updated_at": datetime.now(UTC).isoformat()},
                    headers=self.headers
                )
                data = res.json()
                return data[0] if data else None
        else:
            db = self._read_local("conversations")
            for c in db:
                if c["id"] == conv_id and c["user_id"] == user_id:
                    c["title"] = title
                    c["updated_at"] = datetime.now(UTC).isoformat()
                    self._write_local("conversations", db)
                    return c
            return None

    async def delete_conversation(self, conv_id: str, user_id: str) -> bool:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.patch(
                    f"{self.url}/rest/v1/conversations?id=eq.{conv_id}&user_id=eq.{user_id}",
                    json={"deleted_at": datetime.now(UTC).isoformat()},
                    headers=self.headers
                )
                return res.status_code < 400
        else:
            db = self._read_local("conversations")
            for c in db:
                if c["id"] == conv_id and c["user_id"] == user_id:
                    c["deleted_at"] = datetime.now(UTC).isoformat()
                    self._write_local("conversations", db)
                    return True
            return False

    async def save_message(self, conv_id: str, role: str, content: str) -> Dict[str, Any]:
        import uuid
        msg = {
            "id": str(uuid.uuid4()),
            "conversation_id": conv_id,
            "role": role,
            "content": content,
            "created_at": datetime.now(UTC).isoformat()
        }
        
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                await client.post(f"{self.url}/rest/v1/messages", json=msg, headers=self.headers)
                # Touch conversation timestamp
                await client.patch(
                    f"{self.url}/rest/v1/conversations?id=eq.{conv_id}",
                    json={"updated_at": datetime.now(UTC).isoformat()},
                    headers={**self.headers, "Prefer": "return=minimal"}
                )
                return msg
        else:
            db = self._read_local("messages")
            db.append(msg)
            self._write_local("messages", db)
            
            # Touch local conversation timestamp
            convs = self._read_local("conversations")
            for c in convs:
                if c["id"] == conv_id:
                    c["updated_at"] = datetime.now(UTC).isoformat()
            self._write_local("conversations", convs)
            return msg

    async def get_messages(self, conv_id: str) -> List[Dict[str, Any]]:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.get(f"{self.url}/rest/v1/messages?conversation_id=eq.{conv_id}&order=created_at.asc", headers=self.headers)
                return res.json()
        else:
            db = self._read_local("messages")
            return [m for m in db if m["conversation_id"] == conv_id]

    # ------------------ FEEDBACK ------------------
    async def save_feedback(self, conv_id: str, rating: int, comment: Optional[str] = None, is_positive: Optional[bool] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        import uuid
        fb = {
            "id": str(uuid.uuid4()),
            "conversation_id": conv_id,
            "user_id": user_id,
            "rating": rating,
            "comment": comment,
            "is_positive": is_positive,
            "created_at": datetime.now(UTC).isoformat()
        }
        
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.post(f"{self.url}/rest/v1/feedback", json=fb, headers=self.headers)
                return res.json()[0]
        else:
            db = self._read_local("feedback")
            db.append(fb)
            self._write_local("feedback", db)
            return fb

    # ------------------ SAVED CHARTS ------------------
    async def save_chart(self, user_id: str, label: str, chart_data: Dict[str, Any]) -> Dict[str, Any]:
        import uuid
        record = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "label": label,
            "chart_data": chart_data,
            "created_at": datetime.now(UTC).isoformat()
        }
        
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.post(f"{self.url}/rest/v1/saved_charts", json=record, headers=self.headers)
                return res.json()[0]
        else:
            db = self._read_local("saved_charts")
            db.append(record)
            self._write_local("saved_charts", db)
            return record

    async def get_saved_charts(self, user_id: str) -> List[Dict[str, Any]]:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.get(f"{self.url}/rest/v1/saved_charts?user_id=eq.{user_id}&deleted_at=is.null", headers=self.headers)
                return res.json()
        else:
            db = self._read_local("saved_charts")
            return [c for c in db if c["user_id"] == user_id and not c.get("deleted_at")]

    async def delete_saved_chart(self, chart_id: str, user_id: str) -> bool:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.patch(
                    f"{self.url}/rest/v1/saved_charts?id=eq.{chart_id}&user_id=eq.{user_id}",
                    json={"deleted_at": datetime.now(UTC).isoformat()},
                    headers=self.headers
                )
                return res.status_code < 400
        else:
            db = self._read_local("saved_charts")
            for c in db:
                if c["id"] == chart_id and c["user_id"] == user_id:
                    c["deleted_at"] = datetime.now(UTC).isoformat()
                    self._write_local("saved_charts", db)
                    return True
            return False

    # ------------------ USAGE & ADMIN ANALYTICS ------------------
    async def track_usage(self, user_id: Optional[str], ip: str, action: str, endpoint: str, latency: int, status_code: int):
        import uuid
        payload = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "ip_address": ip,
            "action": action,
            "api_endpoint": endpoint,
            "latency_ms": latency,
            "status_code": status_code,
            "created_at": datetime.now(UTC).isoformat()
        }
        
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                await client.post(f"{self.url}/rest/v1/usage", json=payload, headers={**self.headers, "Prefer": "return=minimal"})
        else:
            db = self._read_local("usage")
            db.append(payload)
            self._write_local("usage", db)

    async def get_usage_count(self, user_id: str, action: str, hours: int = 24) -> int:
        """Helper to compute rate-limiting statistics."""
        # Find usage within timezone window
        now_dt = datetime.now(UTC)
        
        if self.use_supabase:
            # Query count dynamically
            iso_start = (now_dt - timedelta(hours=hours)).isoformat()
            async with httpx.AsyncClient() as client:
                res = await client.get(
                    f"{self.url}/rest/v1/usage?user_id=eq.{user_id}&action=eq.{action}&created_at=gte.{iso_start}",
                    headers={**self.headers, "Prefer": "count=exact"}
                )
                # PostgREST returns content-range or count in headers if requested
                # If reading direct, len(res.json()) is simple
                return len(res.json())
        else:
            db = self._read_local("usage")
            count = 0
            for u in db:
                if u["user_id"] == user_id and u["action"] == action:
                    u_time = datetime.fromisoformat(u["created_at"])
                    if (now_dt - u_time).total_seconds() <= (hours * 3600):
                        count += 1
            return count

    async def get_admin_analytics(self) -> Dict[str, Any]:
        """Compiles stats for the Admin Dashboard."""
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                users_res = await client.get(f"{self.url}/rest/v1/profiles", headers={**self.headers, "Prefer": "count=exact"})
                convs_res = await client.get(f"{self.url}/rest/v1/conversations", headers={**self.headers, "Prefer": "count=exact"})
                fb_res = await client.get(f"{self.url}/rest/v1/feedback", headers={**self.headers, "Prefer": "count=exact"})
                usage_res = await client.get(f"{self.url}/rest/v1/usage", headers={**self.headers, "Prefer": "count=exact"})
                
                users = users_res.json()
                convs = convs_res.json()
                feedback = fb_res.json()
                usage = usage_res.json()
        else:
            users = self._read_local("profiles")
            convs = self._read_local("conversations")
            feedback = self._read_local("feedback")
            usage = self._read_local("usage")

        # Compile summaries
        tot_users = len(users)
        tot_convs = len([c for c in convs if not c.get("deleted_at")])
        
        avg_rating = 0.0
        if feedback:
            avg_rating = sum(f["rating"] for f in feedback) / len(feedback)
            
        avg_latency = 0.0
        err_count = 0
        chart_count = 0
        if usage:
            avg_latency = sum(u["latency_ms"] for u in usage) / len(usage)
            err_count = len([u for u in usage if u["status_code"] >= 400])
            chart_count = len([u for u in usage if u["action"] == "chart_calculation"])

        return {
            "totalUsers": tot_users,
            "totalConversations": tot_convs,
            "averageRating": round(avg_rating, 2),
            "averageLatencyMs": round(avg_latency, 1),
            "errorRatePercent": round((err_count / len(usage)) * 100, 2) if usage else 0.0,
            "chartCalculationsCount": chart_count,
            "recentFeedback": feedback[-5:]
        }

    # ------------------ PRIVACY / EXPORT ------------------
    async def delete_account(self, user_id: str) -> bool:
        if self.use_supabase:
            async with httpx.AsyncClient() as client:
                res = await client.delete(f"{self.url}/rest/v1/profiles?id=eq.{user_id}", headers=self.headers)
                return res.status_code < 400
        else:
            # Local cascade deletions
            db_profiles = self._read_local("profiles")
            db_profiles = [u for u in db_profiles if u["id"] != user_id]
            self._write_local("profiles", db_profiles)
            
            db_birth = self._read_local("saved_birth_details")
            db_birth = [b for b in db_birth if b["user_id"] != user_id]
            self._write_local("saved_birth_details", db_birth)
            
            db_convs = self._read_local("conversations")
            db_convs = [c for c in db_convs if c["user_id"] != user_id]
            self._write_local("conversations", db_convs)
            
            db_charts = self._read_local("saved_charts")
            db_charts = [c for c in db_charts if c["user_id"] != user_id]
            self._write_local("saved_charts", db_charts)
            return True

    async def export_user_data(self, user_id: str) -> Dict[str, Any]:
        profile = await self.get_profile(user_id)
        birth = await self.get_saved_birth_details(user_id)
        convs = await self.get_conversations(user_id)
        charts = await self.get_saved_charts(user_id)
        
        return {
            "profile": profile,
            "savedBirthDetails": birth,
            "conversationsCount": len(convs),
            "savedChartsCount": len(charts),
            "exportTimestamp": datetime.now(UTC).isoformat()
        }

# Singleton instance
db_service = DatabaseService()
