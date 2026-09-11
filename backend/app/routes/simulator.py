import uuid
from pathlib import Path
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, Field
from typing import Optional
from app.config import settings
from app.services.parser import process_incoming_text_message
from app.services.gemini import extract_vision_with_gemini
from app import database

router = APIRouter(prefix="/simulator", tags=["Simulator"])

class SimulateMessageRequest(BaseModel):
    sender: str = Field(default="Ketua Kelas", description="Nama atau nomor pengirim WhatsApp")
    message: str = Field(..., description="Isi teks pesan yang disimulasikan masuk ke grup")
    whatsapp_message_id: Optional[str] = Field(default=None, description="Opsional ID simulasi WhatsApp")

@router.post("/send")
def simulate_whatsapp_message(payload: SimulateMessageRequest):
    """
    Simulator endpoint:
    Menerima pesan seolah-olah masuk dari WhatsApp grup kelas,
    menganalisisnya via Gemini, dan menyimpannya ke database.
    """
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Pesan tidak boleh kosong")

    result = process_incoming_text_message(
        sender=payload.sender,
        message_text=payload.message,
        whatsapp_message_id=payload.whatsapp_message_id or "sim_msg_001"
    )

    # Attach live dashboard stats to the response
    result["dashboard_summary"] = database.get_dashboard_summary()
    return result

@router.get("/history")
def get_simulation_history(limit: int = 50):
    """Mengambil riwayat pesan yang telah diproses."""
    return database.list_messages(limit=limit)

@router.post("/send-media")
async def simulate_whatsapp_media(
    file: UploadFile = File(...),
    sender: str = Form(default="Siti"),
    caption: Optional[str] = Form(default="")
):
    """
    Simulasi pengiriman gambar/screenshot ke WhatsApp grup 1INFA.
    """
    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="File gambar kosong")

    # Save media file locally for preview
    upload_dir = Path(settings.SQLITE_DB_PATH).parent / "uploads"
    upload_dir.mkdir(exist_ok=True)
    filename = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = upload_dir / filename
    with open(file_path, "wb") as f:
        f.write(image_bytes)

    # 1. Log message to database
    msg_content = caption.strip() if caption.strip() else f"📷 [Screenshot/Foto: {file.filename}]"
    saved_msg = database.insert_message(
        sender=sender,
        content=msg_content,
        media_url=f"/uploads/{filename}",
        message_type="image",
        whatsapp_message_id=f"sim_img_{uuid.uuid4().hex[:6]}"
    )
    message_id = saved_msg["id"]

    # 2. Extract with Gemini Vision
    extracted = extract_vision_with_gemini(
        image_bytes=image_bytes,
        mime_type=file.content_type,
        user_prompt=caption
    )

    msg_type = extracted.get("type", "schedule").lower()
    saved_entity = None

    if msg_type == "schedule":
        saved_entity = database.insert_schedule(
            subject=extracted.get("subject") or "Jadwal Perkuliahan",
            start_time=extracted.get("start_time") or "10:15",
            end_time=extracted.get("end_time") or "11:55",
            day_of_week=extracted.get("day_of_week") or "Senin",
            date=extracted.get("date"),
            location=extracted.get("location") or "Ruang Kuliah",
            source_message_id=message_id
        )
    elif msg_type == "assignment":
        saved_entity = database.insert_assignment(
            subject=extracted.get("subject") or "Tugas Kuliah",
            title=extracted.get("title") or "Tugas dari Gambar",
            deadline=extracted.get("deadline") or "2026-09-30T23:59:00",
            description=extracted.get("content") or msg_content,
            source_message_id=message_id
        )
    elif msg_type == "announcement":
        saved_entity = database.insert_announcement(
            title=extracted.get("title") or "Pengumuman Gambar",
            content=extracted.get("content") or msg_content,
            source_message_id=message_id
        )

    return {
        "status": "success",
        "message_id": message_id,
        "sender": sender,
        "media_url": f"/uploads/{filename}",
        "raw_message": msg_content,
        "extracted": extracted,
        "category": msg_type,
        "saved_entity": saved_entity,
        "dashboard_summary": database.get_dashboard_summary()
    }

