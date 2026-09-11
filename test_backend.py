import httpx

client = httpx.Client(base_url="http://127.0.0.1:8000")

# 1. Health check
res = client.get("/health")
print("Health:", res.json())

# 2. Simulate text message: Schedule
res = client.post("/simulator/send", json={
    "sender": "Pak Dosen",
    "message": "Kuliah Algoritma dan Pemrograman hari Senin jam 08.00 sampai 10.00 di Lab Komputer 2."
})
print("Simulate schedule response category:", res.json().get("category"))

# 3. Simulate text message: Announcement
res = client.post("/simulator/send", json={
    "sender": "Ketua Tingkat",
    "message": "Pengumuman: Besok gladi bersih upacara fakultas di lapangan utama jam 07.00."
})
print("Simulate announcement category:", res.json().get("category"))

# 4. Chat AI query
res = client.post("/chat", json={"query": "Tugas apa saja yang harus dikumpulkan?"})
reply_text = res.json().get("reply", "")
print("Chat AI answer:\n", reply_text.encode("ascii", errors="replace").decode())

# 5. Stats
res = client.get("/stats")
stats = res.json()
print("Updated Stats -> Total Tasks:", stats["total_tasks"], "Schedules:", stats["total_schedules"], "Announcements:", stats["total_announcements"])

