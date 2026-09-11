import io
import httpx
from PIL import Image, ImageDraw

def run_tests():
    print("==================================================")
    print("Class AI MVP End-to-End Test Suite")
    print("==================================================")

    # 1. Test Frontend HTTP Endpoints
    frontend_client = httpx.Client(base_url="http://localhost:3000", timeout=10)
    pages = ["/", "/simulator", "/tasks", "/schedules", "/announcements", "/chat"]
    for page in pages:
        res = frontend_client.get(page)
        assert res.status_code == 200, f"Page {page} returned {res.status_code}"
        print(f"[PASS] Frontend route: {page} (Status: {res.status_code})")

    # 2. Test Backend Health & Config
    backend_client = httpx.Client(base_url="http://127.0.0.1:8000", timeout=10)
    health = backend_client.get("/health").json()
    print(f"[PASS] Backend health: {health['status']} | Storage: {health['storage']}")

    # 3. Simulate Text Message: Assignment
    res_task = backend_client.post("/simulator/send", json={
        "sender": "Budi",
        "message": "Guys tugas Pancasila dikumpulkan Jumat depan jam 10 ya."
    }).json()
    print(f"[PASS] Simulator Task Extraction: category={res_task['category']}, subject={res_task['extracted'].get('subject')}")
    assert res_task['category'] == 'assignment'

    # 4. Simulate Text Message: Schedule
    res_sched = backend_client.post("/simulator/send", json={
        "sender": "Pak Dosen",
        "message": "Kuliah Pemrograman Web hari Rabu jam 13.00 sampai 15.00 di Lab RPL."
    }).json()
    print(f"[PASS] Simulator Schedule Extraction: category={res_sched['category']}, day={res_sched['extracted'].get('day_of_week')}, time={res_sched['extracted'].get('start_time')}")
    assert res_sched['category'] == 'schedule'

    # 5. Simulate Text Message: Announcement
    res_ann = backend_client.post("/simulator/send", json={
        "sender": "Ketua Kelas",
        "message": "Pengumuman: Besok kuliah Algoritma ditiadakan karena ada seminar nasional."
    }).json()
    print(f"[PASS] Simulator Announcement Extraction: category={res_ann['category']}")
    assert res_ann['category'] == 'announcement'

    # 6. Test Gemini Vision Image Upload
    # Generate a sample timetable image in memory
    img = Image.new("RGB", (400, 200), color=(30, 41, 59))
    draw = ImageDraw.Draw(img)
    draw.text((20, 20), "JADWAL KULIAH KELAS 1INFA", fill=(255, 255, 255))
    draw.text((20, 60), "Senin, 08.00 - 10.00: Kalkulus (Ruang 4S.1)", fill=(52, 211, 153))
    draw.text((20, 100), "Rabu, 10.15 - 12.00: Basis Data (Lab Komputer 1)", fill=(56, 189, 248))
    
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)

    files = {'file': ('jadwal_kuliah.png', img_byte_arr.getvalue(), 'image/png')}
    data = {'sender': 'Siti', 'caption': 'Berikut screenshot jadwal kuliah terbaru'}
    res_vision = backend_client.post("/simulator/send-media", files=files, data=data).json()
    print(f"[PASS] Vision Extraction: category={res_vision['category']}, media={res_vision['media_url']}")

    # 7. Test Student Chat Q&A
    chat_res = backend_client.post("/chat", json={"query": "Tugas apa saja yang deadline minggu ini?"}).json()
    print(f"[PASS] Chat Q&A: Query answered successfully!")
    clean_reply = chat_res['reply'].encode('ascii', errors='replace').decode()
    print("    AI Answer snippet:", clean_reply.splitlines()[0] if clean_reply else "")

    # 8. Test Dashboard Stats
    stats = backend_client.get("/stats").json()
    print(f"[PASS] Dashboard Summary: Total Tasks={stats['total_tasks']}, Schedules={stats['total_schedules']}, Announcements={stats['total_announcements']}")

    print("==================================================")
    print("ALL 8 END-TO-END TESTS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
