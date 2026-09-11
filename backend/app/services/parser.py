from typing import Dict, Any, Optional
from app.services.gemini import extract_info_with_gemini
from app import database

def process_incoming_text_message(sender: str, message_text: str, whatsapp_message_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Main pipeline:
    1. Log message to 'messages'
    2. Extract information with Gemini (google-genai)
    3. Save structured data into 'assignments', 'schedules', or 'announcements'
    4. Return full execution details
    """
    # 1. Save raw message
    saved_msg = database.insert_message(
        sender=sender,
        content=message_text,
        message_type="text",
        whatsapp_message_id=whatsapp_message_id
    )
    message_id = saved_msg["id"]

    # 2. Extract with Gemini
    extracted = extract_info_with_gemini(message_text)
    msg_type = extracted.get("type", "general").lower()

    saved_entity = None

    # 3. Route & save structured data
    if msg_type == "assignment":
        subject = extracted.get("subject") or "Kuliah Umum"
        title = extracted.get("title") or f"Tugas {subject}"
        description = extracted.get("content") or message_text
        deadline = extracted.get("deadline") or "2026-09-30T23:59:00"

        saved_entity = database.insert_assignment(
            subject=subject,
            title=title,
            description=description,
            deadline=deadline,
            source_message_id=message_id
        )

    elif msg_type == "schedule":
        subject = extracted.get("subject") or "Jadwal Perkuliahan"
        date = extracted.get("date")
        day_of_week = extracted.get("day_of_week") or "Senin"
        start_time = extracted.get("start_time") or "08:00"
        end_time = extracted.get("end_time") or "10:00"
        location = extracted.get("location") or "Ruang Kuliah"

        saved_entity = database.insert_schedule(
            subject=subject,
            start_time=start_time,
            end_time=end_time,
            day_of_week=day_of_week,
            date=date,
            location=location,
            source_message_id=message_id
        )

    elif msg_type == "announcement":
        title = extracted.get("title") or "Pengumuman Kelas"
        content = extracted.get("content") or message_text

        saved_entity = database.insert_announcement(
            title=title,
            content=content,
            source_message_id=message_id
        )

    return {
        "status": "success",
        "message_id": message_id,
        "raw_message": message_text,
        "sender": sender,
        "extracted": extracted,
        "category": msg_type,
        "saved_entity": saved_entity
    }
