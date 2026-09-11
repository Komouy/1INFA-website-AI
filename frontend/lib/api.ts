// API Client for Class AI FastAPI Backend
export const API_BASE = "http://localhost:8000";

export interface Task {
  id: string;
  subject: string;
  title: string;
  description: string;
  deadline: string;
  status: 'pending' | 'completed';
  created_at: string;
}

export interface Schedule {
  id: string;
  subject: string;
  day_of_week: string;
  date?: string;
  start_time: string;
  end_time: string;
  location: string;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface MessageLog {
  id: string;
  whatsapp_message_id?: string;
  sender: string;
  content: string;
  media_url?: string;
  message_type: string;
  created_at: string;
}

export interface DashboardStats {
  storage_mode: string;
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  total_schedules: number;
  total_announcements: number;
  upcoming_deadlines: Task[];
  recent_announcements: Announcement[];
  schedules: Schedule[];
}

// 1. Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/stats`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Gagal mengambil data dashboard");
  return res.json();
}

// 2. Health & Config Status
export async function getHealthStatus() {
  const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Backend offline");
  return res.json();
}

// 3. Tasks
export async function getTasks(status?: string): Promise<Task[]> {
  const url = status ? `${API_BASE}/tasks?status=${status}` : `${API_BASE}/tasks`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error("Gagal mengambil data tugas");
  return res.json();
}

export async function createTask(task: { subject: string; title: string; deadline: string; description?: string }) {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });
  if (!res.ok) throw new Error("Gagal menambahkan tugas");
  return res.json();
}

export async function updateTaskStatus(taskId: string, status: 'pending' | 'completed') {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error("Gagal mengubah status tugas");
  return res.json();
}

export async function deleteTask(taskId: string) {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error("Gagal menghapus tugas");
  return res.json();
}

// 4. Schedules
export async function getSchedules(): Promise<Schedule[]> {
  const res = await fetch(`${API_BASE}/schedules`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Gagal mengambil jadwal kuliah");
  return res.json();
}

export async function createSchedule(sched: { subject: string; day_of_week: string; start_time: string; end_time: string; location?: string }) {
  const res = await fetch(`${API_BASE}/schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sched)
  });
  if (!res.ok) throw new Error("Gagal menambahkan jadwal");
  return res.json();
}

export async function deleteSchedule(scheduleId: string) {
  const res = await fetch(`${API_BASE}/schedules/${scheduleId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error("Gagal menghapus jadwal");
  return res.json();
}

// 5. Announcements
export async function getAnnouncements(): Promise<Announcement[]> {
  const res = await fetch(`${API_BASE}/announcements`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Gagal mengambil pengumuman");
  return res.json();
}

export async function createAnnouncement(announcement: { title: string; content: string }) {
  const res = await fetch(`${API_BASE}/announcements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(announcement)
  });
  if (!res.ok) throw new Error("Gagal menambahkan pengumuman");
  return res.json();
}

export async function deleteAnnouncement(announcementId: string) {
  const res = await fetch(`${API_BASE}/announcements/${announcementId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error("Gagal menghapus pengumuman");
  return res.json();
}

// 6. Chat AI
export async function askAiChat(query: string) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  if (!res.ok) throw new Error("Gagal berkomunikasi dengan AI");
  return res.json();
}

// 7. WhatsApp Simulator
export async function sendSimulatorMessage(sender: string, message: string) {
  const res = await fetch(`${API_BASE}/simulator/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sender, message })
  });
  if (!res.ok) throw new Error("Gagal memproses pesan simulator");
  return res.json();
}

export async function sendSimulatorMedia(formData: FormData) {
  const res = await fetch(`${API_BASE}/simulator/send-media`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error("Gagal memproses gambar simulator");
  return res.json();
}

export async function getSimulatorHistory(): Promise<MessageLog[]> {
  const res = await fetch(`${API_BASE}/simulator/history`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Gagal memuat histori simulator");
  return res.json();
}
