import json
import re
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from app.config import settings

# Structured extraction output model
class ExtractedInformation(BaseModel):
    type: str = Field(description="'assignment', 'schedule', 'announcement', or 'general'")
    subject: Optional[str] = Field(default=None, description="Nama mata kuliah jika ada, misal Pancasila, Pemrograman Web")
    title: Optional[str] = Field(default=None, description="Judul ringkas tugas/jadwal/pengumuman")
    content: Optional[str] = Field(default=None, description="Rincian deskripsi pesan")
    deadline: Optional[str] = Field(default=None, description="Deadline dalam format ISO YYYY-MM-DDTHH:MM:SS atau perkiraan tanggal")
    date: Optional[str] = Field(default=None, description="Tanggal dalam format YYYY-MM-DD")
    day_of_week: Optional[str] = Field(default=None, description="Hari dalam bahasa Indonesia: Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu")
    start_time: Optional[str] = Field(default=None, description="Waktu mulai format HH:MM, misal 10:15")
    end_time: Optional[str] = Field(default=None, description="Waktu selesai format HH:MM, misal 11:55")
    location: Optional[str] = Field(default=None, description="Ruangan atau tempat kuliah, misal Ruang 4S.1")
    important: bool = Field(default=False, description="Apakah pesan penting/mendesak")


def get_gemini_client():
    """Returns official google-genai client if API key is provided."""
    if not settings.GEMINI_API_KEY:
        return None
    try:
        from google import genai
        return genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Failed to initialize google-genai client: {e}")
        return None


def extract_info_with_gemini(message_text: str) -> Dict[str, Any]:
    """
    Extracts structured class information using official google-genai SDK.
    Falls back to heuristic parser if API key is not configured.
    """
    client = get_gemini_client()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if client:
        try:
            prompt = f"""You are an AI assistant for a university class WhatsApp group.
Current system datetime is: {now_str}.
Analyze the following WhatsApp message.
Determine whether it contains:
- assignment (tugas kuliah & deadline)
- schedule (jadwal perkuliahan/praktikum, hari, jam, ruangan)
- announcement (pengumuman umum dosen/komti)
- general (obrolan santai biasa / tidak perlu disimpan)

Return a strictly valid JSON object matching this schema:
{{
  "type": "assignment | schedule | announcement | general",
  "subject": "Nama Mata Kuliah atau null",
  "title": "Judul singkat atau null",
  "content": "Rangkuman isi atau null",
  "deadline": "YYYY-MM-DDTHH:MM:SS jika ada batas waktu atau null",
  "date": "YYYY-MM-DD jika ada tanggal spesifik atau null",
  "day_of_week": "Senin | Selasa | Rabu | Kamis | Jumat | Sabtu | Minggu atau null",
  "start_time": "HH:MM atau null",
  "end_time": "HH:MM atau null",
  "location": "Ruangan/lokasi atau null",
  "important": true | false
}}

Message to analyze:
\"\"\"{message_text}\"\"\"
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config={
                    "response_mime_type": "application/json"
                }
            )

            if response.text:
                clean_json = response.text.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                parsed = json.loads(clean_json.strip())
                return parsed
        except Exception as e:
            print(f"Gemini generation error: {e}. Falling back to rule-based parser.")

    # Fallback heuristic parser when offline or without API key
    return fallback_heuristic_parser(message_text)


def extract_vision_with_gemini(image_bytes: bytes, mime_type: str = "image/jpeg", user_prompt: Optional[str] = None) -> Dict[str, Any]:
    """
    Extracts structured schedule or announcement information from screenshot/photo using Gemini Vision.
    """
    client = get_gemini_client()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if client:
        try:
            from google.genai import types

            prompt = f"""You are an AI assistant for university students.
Current system datetime: {now_str}.
Carefully inspect this screenshot / image (such as a lecture schedule, exam timetable, academic announcement, or class board).
Extract structured information into JSON:
{{
  "type": "schedule | assignment | announcement | general",
  "subject": "Mata kuliah terkait atau null",
  "title": "Judul informasi atau null",
  "content": "Rangkuman lengkap teks dalam gambar",
  "deadline": "YYYY-MM-DDTHH:MM:SS jika ada deadline atau null",
  "date": "YYYY-MM-DD jika tertera tanggal atau null",
  "day_of_week": "Hari (Senin-Minggu) atau null",
  "start_time": "HH:MM atau null",
  "end_time": "HH:MM atau null",
  "location": "Ruang kelas / Gedung / Link kuliah atau null",
  "important": true
}}

Instructions: Return strictly raw JSON only.
User note: {user_prompt or 'Ekstrak informasi perkuliahan dari gambar ini.'}
"""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    prompt
                ],
                config={
                    "response_mime_type": "application/json"
                }
            )

            if response.text:
                clean_json = response.text.strip()
                if clean_json.startswith("```json"):
                    clean_json = clean_json[7:]
                if clean_json.endswith("```"):
                    clean_json = clean_json[:-3]
                return json.loads(clean_json.strip())
        except Exception as e:
            print(f"Gemini vision error: {e}")

    # Fallback response if offline or key not provided
    return {
        "type": "schedule",
        "subject": "Jadwal Kuliah (Dari Screenshot)",
        "title": "Hasil Ekstraksi Gambar",
        "content": "Gambar terdeteksi. Silakan konfigurasikan GEMINI_API_KEY di backend/.env untuk pemrosesan AI Vision otomatis.",
        "deadline": None,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "day_of_week": "Senin",
        "start_time": "10:15",
        "end_time": "11:55",
        "location": "Ruang 4S.1",
        "important": True
    }


def answer_student_chat(query: str, assignments: List[Dict[str, Any]], schedules: List[Dict[str, Any]], announcements: List[Dict[str, Any]]) -> str:
    """
    Answers student questions using Gemini with live class context.
    """
    client = get_gemini_client()

    context_text = f"""
DATA TUGAS AKTIF ({len(assignments)} tugas):
{json.dumps(assignments, indent=2, ensure_ascii=False)}

DATA JADWAL KULIAH ({len(schedules)} jadwal):
{json.dumps(schedules, indent=2, ensure_ascii=False)}

DATA PENGUMUMAN KELAS ({len(announcements)} pengumuman):
{json.dumps(announcements, indent=2, ensure_ascii=False)}
"""

    if client:
        try:
            prompt = f"""Kamu adalah Class AI Assistant untuk mahasiswa kelas 1INFA.
Jawab pertanyaan mahasiswa berikut secara ramah, ringkas, jelas, dan akurat berdasarkan data perkuliahan yang tercatat.
Gunakan Bahasa Indonesia yang sopan dan santai (ala mahasiswa).
Gunakan poin-poin jika menyebutkan daftar tugas atau jadwal kuliah.

{context_text}

Pertanyaan Mahasiswa:
\"{query}\"
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response.text:
                return response.text.strip()
        except Exception as e:
            print(f"Gemini chat error: {e}")

    # Fallback intelligent local responder
    q_lower = query.lower()
    if "tugas" in q_lower or "deadline" in q_lower:
        if not assignments:
            return "Saat ini belum ada tugas aktif yang tercatat di sistem. Semuanya sudah beres! 🎉"
        res = f"Saat ini tercatat ada {len(assignments)} tugas perkuliahan:\n"
        for idx, a in enumerate(assignments, 1):
            dl = a.get("deadline", "Tidak ada deadline spesifik")
            res += f"{idx}. **{a.get('subject')}** - {a.get('title')}\n   📅 Deadline: {dl}\n"
        return res

    if "jadwal" in q_lower or "kuliah" in q_lower:
        if not schedules:
            return "Belum ada jadwal kuliah yang terdaftar di sistem saat ini."
        res = f"Berikut jadwal perkuliahan kelas:\n"
        for s in schedules:
            res += f"• **{s.get('subject')}** ({s.get('day_of_week') or 'Hari ini'}, {s.get('start_time')} - {s.get('end_time')}) di {s.get('location') or 'Ruang Kelas'}\n"
        return res

    return "Halo! Saya asisten Class AI. Kamu bisa menanyakan seputar tugas yang harus dikumpulkan, jadwal kuliah terdekat, atau pengumuman kelas."


def fallback_heuristic_parser(text: str) -> Dict[str, Any]:
    """Smart heuristic parser for offline development and instant feedback."""
    text_lower = text.lower()

    is_assignment = any(w in text_lower for w in ["tugas", "deadline", "kumpul", "dikumpulkan", "pr", "submission"])
    
    # Days of week detection
    days_map = {
        "senin": "Senin", "selasa": "Selasa", "rabu": "Rabu",
        "kamis": "Kamis", "jumat": "Jumat", "sabtu": "Sabtu", "minggu": "Minggu"
    }
    detected_day = None
    for d_key, d_val in days_map.items():
        if d_key in text_lower:
            detected_day = d_val
            break

    # Time detection (e.g. 08.00, 10:15, jam 8)
    time_matches = re.findall(r'(\d{1,2})[.:](\d{2})', text)
    start_time = "08:00"
    end_time = "10:00"
    if len(time_matches) >= 2:
        start_time = f"{int(time_matches[0][0]):02d}:{time_matches[0][1]}"
        end_time = f"{int(time_matches[1][0]):02d}:{time_matches[1][1]}"
    elif len(time_matches) == 1:
        start_time = f"{int(time_matches[0][0]):02d}:{time_matches[0][1]}"
        end_time = f"{min(23, int(time_matches[0][0])+2):02d}:{time_matches[0][1]}"

    is_schedule = (
        any(w in text_lower for w in ["jadwal", "ruang", "lab", "kelas", "kuliah"]) and 
        (detected_day is not None or len(time_matches) > 0 or "jam" in text_lower)
    )
    is_announcement = any(w in text_lower for w in ["pengumuman", "info", "perhatian", "dosen mengabarkan", "diliburkan", "gladi"])


    now = datetime.now()

    if is_assignment:
        # Detect subject candidates
        subject = "Mata Kuliah Umum"
        subjects_map = {
            "pancasila": "Pancasila",
            "informatika": "Pengantar Informatika",
            "algoritma": "Algoritma & Pemrograman",
            "pemrograman": "Pemrograman Web",
            "matematika": "Matematika Diskrit",
            "basis data": "Basis Data",
            "jaringan": "Jaringan Komputer",
            "kalkulus": "Kalkulus",
            "ddp": "Dasar-Dasar Pemrograman"
        }
        for key, val in subjects_map.items():
            if key in text_lower:
                subject = val
                break

        # Calculate deadline approximation
        deadline_dt = now + timedelta(days=3, hours=10)
        if "besok" in text_lower:
            deadline_dt = (now + timedelta(days=1)).replace(hour=23, minute=59, second=0)
        elif "jumat" in text_lower:
            days_ahead = (4 - now.weekday() + 7) % 7
            if days_ahead == 0:
                days_ahead = 7
            deadline_dt = (now + timedelta(days=days_ahead)).replace(hour=10, minute=0, second=0)
        elif "minggu depan" in text_lower:
            deadline_dt = (now + timedelta(days=7)).replace(hour=12, minute=0, second=0)

        return {
            "type": "assignment",
            "subject": subject,
            "title": f"Tugas {subject}",
            "content": text,
            "deadline": deadline_dt.strftime("%Y-%m-%dT%H:%M:%S"),
            "date": deadline_dt.strftime("%Y-%m-%d"),
            "day_of_week": None,
            "start_time": None,
            "end_time": None,
            "location": None,
            "important": True
        }

    elif is_schedule:
        # Detect subject candidates for schedule
        sched_subject = "Perkuliahan"
        sched_map = {
            "algoritma": "Algoritma & Pemrograman",
            "pancasila": "Pancasila",
            "pemrograman": "Pemrograman Web",
            "matematika": "Matematika Diskrit",
            "basis data": "Basis Data",
            "jaringan": "Jaringan Komputer",
            "kalkulus": "Kalkulus",
            "informatika": "Pengantar Informatika"
        }
        for k, v in sched_map.items():
            if k in text_lower:
                sched_subject = v
                break

        # Detect location
        loc = "Ruang Kelas"
        loc_match = re.search(r'(lab\s+[\w\d]+|ruang\s+[\w\d.]+)', text_lower)
        if loc_match:
            loc = loc_match.group(1).title()

        return {
            "type": "schedule",
            "subject": sched_subject,
            "title": f"Jadwal {sched_subject}",
            "content": text,
            "deadline": None,
            "date": now.strftime("%Y-%m-%d"),
            "day_of_week": detected_day or "Senin",
            "start_time": start_time,
            "end_time": end_time,
            "location": loc,
            "important": True
        }


    elif is_announcement:
        return {
            "type": "announcement",
            "subject": None,
            "title": "Pengumuman Kelas",
            "content": text,
            "deadline": None,
            "date": now.strftime("%Y-%m-%d"),
            "day_of_week": None,
            "start_time": None,
            "end_time": None,
            "location": None,
            "important": False
        }

    return {
        "type": "general",
        "subject": None,
        "title": None,
        "content": text,
        "deadline": None,
        "date": None,
        "day_of_week": None,
        "start_time": None,
        "end_time": None,
        "location": None,
        "important": False
    }
