from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app import database

router = APIRouter(prefix="/announcements", tags=["Announcements"])

class CreateAnnouncementRequest(BaseModel):
    title: str = Field(..., description="Judul pengumuman")
    content: str = Field(..., description="Isi lengkap pengumuman")

@router.get("")
def get_all_announcements(limit: int = 50):
    """Mengambil seluruh pengumuman kelas."""
    return database.list_announcements(limit=limit)

@router.post("")
def create_announcement(payload: CreateAnnouncementRequest):
    """Menambahkan pengumuman secara manual."""
    new_announcement = database.insert_announcement(
        title=payload.title,
        content=payload.content
    )
    return new_announcement

@router.delete("/{announcement_id}")
def delete_announcement(announcement_id: str):
    """Menghapus pengumuman."""
    success = database.delete_announcement(announcement_id)
    if not success:
        raise HTTPException(status_code=404, detail="Pengumuman tidak ditemukan")
    return {"status": "success", "message": "Pengumuman berhasil dihapus"}
