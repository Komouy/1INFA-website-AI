// types/index.ts - Core types for KlassiA Dashboard

export type NavTab = "overview" | "bulletin" | "deadlines" | "schedule" | "summary" | "quiz" | "chatai";

export interface BulletinItem {
  id: string;
  title: string;
  category: "kas" | "pdh" | "buku" | "pengumuman" | "random";
  content: string;
  tag?: string;
  highlight?: string;
  sourceMessage?: string;
  date?: string;
}

export interface Message {
  id: string;
  sender_name: string;
  sender_number: string;
  group_name: string;
  group_id?: string;
  content: string | null;
  media_url?: string | null;
  media_type: "text" | "image" | "document" | "video" | "audio" | string;
  category?: "materi" | "tugas" | "pengumuman" | "diskusi" | "jadwal" | "umum";
  timestamp: Date;
  created_at: Date;
}

export interface TaskDeadline {
  id: string;
  title: string;
  course: string;
  dueDate: string; // ISO date or "2026-09-15"
  dueTime: string; // "23:59"
  priority: "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  sourceMessage?: string;
  lecturer?: string;
  type: "tugas_individu" | "tugas_kelompok" | "kuis" | "proyek" | "laporan";
}

export interface ScheduleItem {
  id: string;
  day: "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu";
  course: string;
  code: string;
  lecturer: string;
  startTime: string;
  endTime: string;
  room: string;
  sks: number;
  status: "normal" | "rescheduled" | "cancelled" | "online";
  notes?: string;
  meetLink?: string;
}

export interface CourseSummary {
  id: string;
  course: string;
  date: string;
  topic: string;
  keyPoints: string[];
  actionItems: string[];
  materials: { name: string; type: "pdf" | "link" | "ppt"; url?: string }[];
  aiConfidence: number;
  extractedFromCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizSet {
  id: string;
  title: string;
  course: string;
  description: string;
  durationMinutes: number;
  questions: QuizQuestion[];
  generatedFrom: string;
  difficulty: "Mudah" | "Sedang" | "Sulit";
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  relatedCourse?: string;
  references?: string[];
}
