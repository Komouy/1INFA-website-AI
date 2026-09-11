import os
from pathlib import Path
from pydantic_settings import BaseSettings

# Base directory for backend
BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseSettings):
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    # Gemini API Key (google-genai)
    GEMINI_API_KEY: str = ""

    # Supabase credentials (optional)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # WhatsApp Cloud API Webhook
    WHATSAPP_VERIFY_TOKEN: str = "class_ai_secret_token_2026"
    WHATSAPP_ACCESS_TOKEN: str = ""
    WHATSAPP_PHONE_NUMBER_ID: str = ""

    # Local SQLite persistent storage path
    SQLITE_DB_PATH: str = str(BASE_DIR / "class_ai.db")

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
