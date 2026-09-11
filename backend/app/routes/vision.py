from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.gemini import extract_vision_with_gemini
from app import database

router = APIRouter(prefix="/vision", tags=["Vision / Screenshot Extraction"])

@router.post("/extract")
async def extract_screenshot(
    file: UploadFile = File(..., description="Foto atau screenshot jadwal/pengumuman"),
    sender: Optional[str] = Form(default="Mahasiswa (Upload Screenshot)"),
    prompt_note: Optional[str] = Form(default="Ekstrak informasi perkuliahan dari gambar ini.")
):
    """
    Ekstraksi teks dan data terstruktur dari screenshot jadwal kuliah atau pengumuman via Gemini Vision.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File yang diunggah harus berupa gambar (JPEG/PNG/WEBP)")

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(status_code=400, detail="File gambar kosong")

    # 1. Log message to database
    msg = database.insert_message(
        sender=sender,
        content=f"[Screenshot/Foto: {file.filename}]",
        media_url=file.filename,
        message_type="image"
    )

    # 2. Extract with Gemini Vision
    extracted = extract_vision_with_gemini(
        image_bytes=image_bytes,
        mime_type=file.content_type,
        user_prompt=prompt_note
    )

    msg_type = extracted.get("type", "schedule").lower()
    saved_entity = None

    # 3. Route & save to appropriate table
    if msg_type == "schedule":
        saved_entity = database.insert_schedule(
            subject=extracted.get("subject") or "Jadwal dari Screenshot",
            start_time=extracted.get("start_time") or "10:15",
            end_time=extracted.get("end_time") or "11:55",
            day_of_week=extracted.get("day_of_week") or "Senin",
            date=extracted.get("date"),
            location=extracted.get("location") or "Ruang Kuliah",
            source_message_id=msg["id"]
        )
    elif msg_type == "assignment":
        saved_entity = database.insert_assignment(
            subject=extracted.get("subject") or "Tugas Kuliah",
            title=extracted.get("title") or "Tugas Baru",
            deadline=extracted.get("deadline") or "2026-09-30T23:59:00",
            description=extracted.get("content") or "Diekstrak dari screenshot",
            source_message_id=msg["id"]
        )
    elif msg_type == "announcement":
        saved_entity = database.insert_announcement(
            title=extracted.get("title") or "Pengumuman dari Screenshot",
            content=extracted.get("content") or "Isi pengumuman",
            source_message_id=msg["id"]
        )

    return {
        "status": "success",
        "filename": file.filename,
        "extracted": extracted,
        "category": msg_type,
        "saved_entity": saved_entity,
        "dashboard_summary": database.get_dashboard_summary()
    }
