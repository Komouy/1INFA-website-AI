from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.gemini import answer_student_chat
from app import database

router = APIRouter(prefix="/chat", tags=["Chat AI Assistant"])

class ChatRequest(BaseModel):
    query: str = Field(..., description="Pertanyaan mahasiswa seputar kelas, tugas, atau jadwal")

@router.post("")
def chat_with_ai(payload: ChatRequest):
    """
    Endpoint Chat AI Mahasiswa:
    Menjawab pertanyaan mahasiswa dengan mengacu pada database tugas, jadwal, dan pengumuman kelas aktif.
    """
    query = payload.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Pertanyaan tidak boleh kosong")

    # Fetch live context from database
    assignments = database.list_assignments(status="pending")
    schedules = database.list_schedules()
    announcements = database.list_announcements(limit=10)

    # Generate answer with Gemini
    reply = answer_student_chat(
        query=query,
        assignments=assignments,
        schedules=schedules,
        announcements=announcements
    )

    return {
        "status": "success",
        "query": query,
        "reply": reply,
        "context_summary": {
            "pending_assignments_count": len(assignments),
            "schedules_count": len(schedules),
            "announcements_count": len(announcements)
        }
    }
