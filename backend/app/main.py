import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app import database

# Routers
from app.routes.simulator import router as simulator_router
from app.routes.tasks import router as tasks_router
from app.routes.schedules import router as schedules_router
from app.routes.announcements import router as announcements_router
from app.routes.chat import router as chat_router
from app.routes.vision import router as vision_router
from app.routes.whatsapp import router as whatsapp_router

app = FastAPI(
    title="Class AI Backend API",
    description="Smart WhatsApp Bot & Class Dashboard API powered by FastAPI & Gemini",
    version="1.0.0"
)

# Ensure uploads directory exists and mount it
uploads_path = Path(__file__).resolve().parent.parent / "uploads"
uploads_path.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

# CORS configuration to allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for easy development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route modules
app.include_router(simulator_router)
app.include_router(tasks_router)
app.include_router(schedules_router)
app.include_router(announcements_router)
app.include_router(chat_router)
app.include_router(vision_router)
app.include_router(whatsapp_router)

@app.get("/")
def root():
    return {
        "app": "Class AI API",
        "version": "1.0.0",
        "status": "online",
        "storage_mode": database.get_storage_mode(),
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "storage": database.get_storage_mode(),
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "supabase_configured": bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)
    }

@app.get("/stats")
def dashboard_stats():
    """Returns aggregated summary metrics for the main dashboard."""
    return database.get_dashboard_summary()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
