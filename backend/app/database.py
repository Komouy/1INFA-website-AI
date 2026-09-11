import sqlite3
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.config import settings

# Initialize Supabase client if credentials exist
supabase_client = None
if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        from supabase import create_client, Client
        supabase_client: Optional[Client] = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        print("Connected to Supabase PostgreSQL")
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}. Falling back to SQLite.")
        supabase_client = None


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_sqlite_db():
    """Initializes local SQLite database with required tables if not present."""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.executescript("""
    CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        whatsapp_message_id TEXT,
        sender TEXT NOT NULL,
        content TEXT NOT NULL,
        media_url TEXT,
        message_type TEXT DEFAULT 'text',
        created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assignments (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        deadline TEXT NOT NULL,
        source_message_id TEXT,
        status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL,
        FOREIGN KEY (source_message_id) REFERENCES messages(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS schedules (
        id TEXT PRIMARY KEY,
        subject TEXT NOT NULL,
        date TEXT,
        day_of_week TEXT,
        start_time TEXT NOT NULL,
        end_time TEXT NOT NULL,
        location TEXT,
        source_message_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (source_message_id) REFERENCES messages(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        source_message_id TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (source_message_id) REFERENCES messages(id) ON DELETE SET NULL
    );
    """)
    conn.commit()
    conn.close()


# Automatically initialize SQLite on import
init_sqlite_db()


def get_storage_mode() -> str:
    return "supabase" if supabase_client is not None else "sqlite"


# ==============================================================================
# MESSAGES REPOSITORY
# ==============================================================================

def insert_message(
    sender: str,
    content: str,
    media_url: Optional[str] = None,
    message_type: str = "text",
    whatsapp_message_id: Optional[str] = None
) -> Dict[str, Any]:
    msg_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat() + "Z"
    
    payload = {
        "id": msg_id,
        "whatsapp_message_id": whatsapp_message_id,
        "sender": sender,
        "content": content,
        "media_url": media_url,
        "message_type": message_type,
        "created_at": now_iso
    }

    if supabase_client:
        try:
            res = supabase_client.table("messages").insert(payload).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase insert message error: {e}. Writing to SQLite.")

    # SQLite write
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (id, whatsapp_message_id, sender, content, media_url, message_type, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (msg_id, whatsapp_message_id, sender, content, media_url, message_type, now_iso)
    )
    conn.commit()
    conn.close()
    return payload


def list_messages(limit: int = 50) -> List[Dict[str, Any]]:
    if supabase_client:
        try:
            res = supabase_client.table("messages").select("*").order("created_at", desc=True).limit(limit).execute()
            return res.data
        except Exception as e:
            print(f"Supabase list messages error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM messages ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


# ==============================================================================
# ASSIGNMENTS REPOSITORY
# ==============================================================================

def insert_assignment(
    subject: str,
    title: str,
    deadline: str,
    description: Optional[str] = None,
    source_message_id: Optional[str] = None,
    status: str = "pending"
) -> Dict[str, Any]:
    assignment_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat() + "Z"

    payload = {
        "id": assignment_id,
        "subject": subject,
        "title": title,
        "description": description or "",
        "deadline": deadline,
        "source_message_id": source_message_id,
        "status": status,
        "created_at": now_iso
    }

    if supabase_client:
        try:
            res = supabase_client.table("assignments").insert(payload).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase insert assignment error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO assignments (id, subject, title, description, deadline, source_message_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        (assignment_id, subject, title, description or "", deadline, source_message_id, status, now_iso)
    )
    conn.commit()
    conn.close()
    return payload


def list_assignments(status: Optional[str] = None) -> List[Dict[str, Any]]:
    if supabase_client:
        try:
            query = supabase_client.table("assignments").select("*").order("deadline", desc=False)
            if status:
                query = query.eq("status", status)
            res = query.execute()
            return res.data
        except Exception as e:
            print(f"Supabase list assignments error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    if status:
        cursor.execute("SELECT * FROM assignments WHERE status = ? ORDER BY deadline ASC", (status,))
    else:
        cursor.execute("SELECT * FROM assignments ORDER BY deadline ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def update_assignment_status(assignment_id: str, status: str) -> bool:
    if supabase_client:
        try:
            supabase_client.table("assignments").update({"status": status}).eq("id", assignment_id).execute()
            return True
        except Exception as e:
            print(f"Supabase update assignment error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE assignments SET status = ? WHERE id = ?", (status, assignment_id))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def delete_assignment(assignment_id: str) -> bool:
    if supabase_client:
        try:
            supabase_client.table("assignments").delete().eq("id", assignment_id).execute()
            return True
        except Exception as e:
            print(f"Supabase delete assignment error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM assignments WHERE id = ?", (assignment_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


# ==============================================================================
# SCHEDULES REPOSITORY
# ==============================================================================

def insert_schedule(
    subject: str,
    start_time: str,
    end_time: str,
    day_of_week: Optional[str] = None,
    date: Optional[str] = None,
    location: Optional[str] = None,
    source_message_id: Optional[str] = None
) -> Dict[str, Any]:
    schedule_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat() + "Z"

    payload = {
        "id": schedule_id,
        "subject": subject,
        "date": date,
        "day_of_week": day_of_week,
        "start_time": start_time,
        "end_time": end_time,
        "location": location or "",
        "source_message_id": source_message_id,
        "created_at": now_iso
    }

    if supabase_client:
        try:
            res = supabase_client.table("schedules").insert(payload).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase insert schedule error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO schedules (id, subject, date, day_of_week, start_time, end_time, location, source_message_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (schedule_id, subject, date, day_of_week, start_time, end_time, location or "", source_message_id, now_iso)
    )
    conn.commit()
    conn.close()
    return payload


def list_schedules() -> List[Dict[str, Any]]:
    if supabase_client:
        try:
            res = supabase_client.table("schedules").select("*").order("start_time", desc=False).execute()
            return res.data
        except Exception as e:
            print(f"Supabase list schedules error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM schedules ORDER BY day_of_week, start_time ASC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def delete_schedule(schedule_id: str) -> bool:
    if supabase_client:
        try:
            supabase_client.table("schedules").delete().eq("id", schedule_id).execute()
            return True
        except Exception as e:
            print(f"Supabase delete schedule error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM schedules WHERE id = ?", (schedule_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


# ==============================================================================
# ANNOUNCEMENTS REPOSITORY
# ==============================================================================

def insert_announcement(
    title: str,
    content: str,
    source_message_id: Optional[str] = None
) -> Dict[str, Any]:
    announcement_id = str(uuid.uuid4())
    now_iso = datetime.utcnow().isoformat() + "Z"

    payload = {
        "id": announcement_id,
        "title": title,
        "content": content,
        "source_message_id": source_message_id,
        "created_at": now_iso
    }

    if supabase_client:
        try:
            res = supabase_client.table("announcements").insert(payload).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]
        except Exception as e:
            print(f"Supabase insert announcement error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO announcements (id, title, content, source_message_id, created_at) VALUES (?, ?, ?, ?, ?)",
        (announcement_id, title, content, source_message_id, now_iso)
    )
    conn.commit()
    conn.close()
    return payload


def list_announcements(limit: int = 50) -> List[Dict[str, Any]]:
    if supabase_client:
        try:
            res = supabase_client.table("announcements").select("*").order("created_at", desc=True).limit(limit).execute()
            return res.data
        except Exception as e:
            print(f"Supabase list announcements error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM announcements ORDER BY created_at DESC LIMIT ?", (limit,))
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return rows


def delete_announcement(announcement_id: str) -> bool:
    if supabase_client:
        try:
            supabase_client.table("announcements").delete().eq("id", announcement_id).execute()
            return True
        except Exception as e:
            print(f"Supabase delete announcement error: {e}")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM announcements WHERE id = ?", (announcement_id,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


# ==============================================================================
# DASHBOARD STATS
# ==============================================================================

def get_dashboard_summary() -> Dict[str, Any]:
    tasks = list_assignments()
    schedules = list_schedules()
    announcements = list_announcements()

    pending_tasks = [t for t in tasks if t.get("status") != "completed"]
    completed_tasks = [t for t in tasks if t.get("status") == "completed"]

    return {
        "storage_mode": get_storage_mode(),
        "total_tasks": len(tasks),
        "pending_tasks": len(pending_tasks),
        "completed_tasks": len(completed_tasks),
        "total_schedules": len(schedules),
        "total_announcements": len(announcements),
        "upcoming_deadlines": pending_tasks[:5],
        "recent_announcements": announcements[:3],
        "schedules": schedules
    }
