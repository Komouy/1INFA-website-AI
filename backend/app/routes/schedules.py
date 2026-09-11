from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from app import database

router = APIRouter(prefix="/schedules", tags=["Schedules"])

class CreateScheduleRequest(BaseModel):
    subject: str = Field(..., description="Nama mata kuliah")
    day_of_week: Optional[str] = Field(default="Senin", description="Hari kuliah")
    date: Optional[str] = Field(default=None, description="Tanggal spesifik jika ada")
    start_time: str = Field(..., description="Waktu mulai, format HH:MM")
    end_time: str = Field(..., description="Waktu selesai, format HH:MM")
    location: Optional[str] = Field(default="", description="Ruang kelas atau link perkuliahan")

@router.get("")
def get_all_schedules():
    """Mengambil seluruh jadwal perkuliahan."""
    return database.list_schedules()

@router.post("")
def create_schedule(payload: CreateScheduleRequest):
    """Menambahkan jadwal kuliah baru secara manual."""
    new_sched = database.insert_schedule(
        subject=payload.subject,
        day_of_week=payload.day_of_week,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        location=payload.location
    )
    return new_sched

@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: str):
    """Menghapus jadwal kuliah."""
    success = database.delete_schedule(schedule_id)
    if not success:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan")
    return {"status": "success", "message": "Jadwal berhasil dihapus"}
