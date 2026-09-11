from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from app import database

router = APIRouter(prefix="/tasks", tags=["Tasks / Assignments"])

class CreateTaskRequest(BaseModel):
    subject: str = Field(..., description="Nama mata kuliah")
    title: str = Field(..., description="Judul tugas")
    deadline: str = Field(..., description="Deadline format ISO (e.g. 2026-09-20T23:59:00)")
    description: Optional[str] = Field(default="", description="Deskripsi atau instruksi tugas")
    status: Optional[str] = Field(default="pending", description="Status: pending | completed")

class UpdateTaskStatusRequest(BaseModel):
    status: str = Field(..., description="Status baru: pending | completed")

@router.get("")
def get_all_tasks(status: Optional[str] = None):
    """Mendapatkan daftar seluruh tugas, dapat difilter berdasarkan status."""
    return database.list_assignments(status=status)

@router.post("")
def create_task(payload: CreateTaskRequest):
    """Menambahkan tugas secara manual."""
    new_task = database.insert_assignment(
        subject=payload.subject,
        title=payload.title,
        deadline=payload.deadline,
        description=payload.description,
        status=payload.status or "pending"
    )
    return new_task

@router.put("/{task_id}/status")
def update_task_status(task_id: str, payload: UpdateTaskStatusRequest):
    """Memperbarui status tugas (misal menjadi 'completed')."""
    success = database.update_assignment_status(task_id, payload.status)
    if not success:
        raise HTTPException(status_code=404, detail="Tugas tidak ditemukan")
    return {"status": "success", "task_id": task_id, "new_status": payload.status}

@router.delete("/{task_id}")
def delete_task(task_id: str):
    """Menghapus tugas dari database."""
    success = database.delete_assignment(task_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tugas tidak ditemukan")
    return {"status": "success", "message": "Tugas berhasil dihapus"}
