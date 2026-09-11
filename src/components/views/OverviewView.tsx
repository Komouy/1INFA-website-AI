"use client";

import React from "react";
import { 
  MessageSquare, 
  Clock, 
  Calendar, 
  Sparkles, 
  ChevronRight,
  Flame,
  FileText,
  BookOpenCheck,
  BrainCircuit,
  BotMessageSquare,
  PlusCircle,
  Video,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  User,
  Lightbulb,
  Bot
} from "lucide-react";
import { Message, TaskDeadline, ScheduleItem, NavTab } from "@/types";

interface OverviewViewProps {
  messages: Message[];
  loading?: boolean;
  deadlines: TaskDeadline[];
  schedules: ScheduleItem[];
  setActiveTab: (tab: NavTab) => void;
  searchQuery?: string;
  groupName?: string;
}

export default function OverviewView({
  messages,
  loading,
  deadlines,
  schedules,
  setActiveTab,
  groupName
}: OverviewViewProps) {
  const activeDeadlines = deadlines.filter((d) => d.status !== "completed");
  const today = new Date();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ─── 4 Top Highlight Stats ─── */}
      <div className="kl-grid-4">
        {/* Stat 1: Total Chat Terproses */}
        <div className="kl-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-dim)" }}>Pesan WA Terbaca</span>
            <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#ecfdf5", color: "#10b981" }}>
              <MessageSquare size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)", lineHeight: 1 }}>
            {messages.length}
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "8px" }}>
            Data tersinkron di Firebase
          </p>
        </div>

        {/* Stat 2: Deadline Aktif */}
        <div 
          onClick={() => setActiveTab("deadlines")}
          className="kl-card kl-card-interactive" 
          style={{ padding: "20px", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-dim)" }}>Tugas & Deadline</span>
            <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#ffe4e6", color: "#e11d48" }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)", lineHeight: 1 }}>
            {activeDeadlines.length}
          </div>
          <p style={{ fontSize: "11px", color: "#e11d48", marginTop: "8px", fontWeight: "600" }}>
            {activeDeadlines.length > 0 ? `${activeDeadlines.length} Tugas aktif` : "Belum ada tugas"}
          </p>
        </div>

        {/* Stat 3: Jadwal Kuliah */}
        <div 
          onClick={() => setActiveTab("schedule")}
          className="kl-card kl-card-interactive" 
          style={{ padding: "20px", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-dim)" }}>Jadwal Kuliah</span>
            <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#ecfeff", color: "#0891b2" }}>
              <Calendar size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)", lineHeight: 1 }}>
            {schedules.length} MK
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "8px" }}>
            Jadwal mingguan kelas
          </p>
        </div>

        {/* Stat 4: AI Asisten */}
        <div 
          onClick={() => setActiveTab("chatai")}
          className="kl-card kl-card-interactive" 
          style={{ padding: "20px", cursor: "pointer" }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-dim)" }}>Asisten AI Kelas</span>
            <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#ecfdf5", color: "#059669" }}>
              <Sparkles size={16} />
            </div>
          </div>
          <div style={{ fontSize: "28px", fontWeight: "800", color: "#059669", lineHeight: 1 }}>
            Aktif
          </div>
          <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "8px" }}>
            Siap menjawab materi kelas
          </p>
        </div>
      </div>

      {/* ─── Main Grid: 2 Column Feature Cards ─── */}
      <div className="kl-grid-2">
        
        {/* Card 1: Reminder & Deadline Section */}
        <div className="kl-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#ffe4e6", color: "#e11d48" }}>
                  <Flame size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>Reminder & Deadline Tugas</h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>Ekstraksi otomatis dari instruksi dosen</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab("deadlines")}
                style={{ fontSize: "12px", fontWeight: "700", color: "#059669", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
              >
                Buka Tracker <ChevronRight size={14} />
              </button>
            </div>

            {deadlines.length === 0 ? (
              <div style={{ padding: "30px 16px", textAlign: "center", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px dashed var(--border)" }}>
                <Clock size={22} style={{ margin: "0 auto 8px auto", color: "#94a3b8" }} />
                <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)", marginBottom: "3px" }}>Belum Ada Deadline Terdeteksi</p>
                <p style={{ fontSize: "11.5px", color: "var(--text-dim)", maxWidth: "320px", margin: "0 auto 12px auto" }}>
                  Setiap pesan dosen mengenai tugas, kuis, atau PR di grup WhatsApp akan dirangkum di sini.
                </p>
                <button
                  onClick={() => setActiveTab("deadlines")}
                  className="kl-btn kl-btn-secondary"
                  style={{ padding: "6px 14px", fontSize: "11.5px" }}
                >
                  <PlusCircle size={13} />
                  <span>Tambah Tugas Manual</span>
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {deadlines.slice(0, 3).map((task) => (
                  <div key={task.id} style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#047857" }}>{task.course}</span>
                      <span className="kl-badge kl-badge-danger">H-2</span>
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>{task.title}</p>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>{task.dueDate} · {task.dueTime} WIB</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab("deadlines")}
            className="kl-btn kl-btn-secondary"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <span>Lihat Semua Daftar Tugas</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Card 2: Jadwal Perkuliahan Section */}
        <div className="kl-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#ecfeff", color: "#0891b2" }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>Jadwal Perkuliahan</h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>Ruangan, dosen, dan tautan daring</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab("schedule")}
                style={{ fontSize: "12px", fontWeight: "700", color: "#059669", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
              >
                Jadwal Penuh <ChevronRight size={14} />
              </button>
            </div>

            {schedules.length === 0 ? (
              <div style={{ padding: "30px 16px", textAlign: "center", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px dashed var(--border)" }}>
                <Calendar size={22} style={{ margin: "0 auto 8px auto", color: "#94a3b8" }} />
                <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)", marginBottom: "3px" }}>Belum Ada Jadwal</p>
                <p style={{ fontSize: "11.5px", color: "var(--text-dim)", maxWidth: "320px", margin: "0 auto" }}>
                  Jadwal perkuliahan mingguan dan tautan Zoom kelas akan ditampilkan secara terstruktur di sini.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {schedules.slice(0, 3).map((sch) => (
                  <div key={sch.id} style={{ padding: "12px 14px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>{sch.course}</span>
                      <span style={{ fontSize: "11px", color: "#0891b2", fontFamily: "monospace", fontWeight: "600" }}>{sch.startTime} - {sch.endTime}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-dim)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><User size={11} /> {sch.lecturer}</span>
                      <span>{sch.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab("schedule")}
            className="kl-btn kl-btn-secondary"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <span>Buka Kalender Jadwal Kuliah</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Card 3: Rangkuman Materi AI Section */}
        <div className="kl-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#fef3c7", color: "#d97706" }}>
                  <BookOpenCheck size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>Rangkuman Materi AI</h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>Ringkasan inti kuliah & catatan penting</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab("summary")}
                style={{ fontSize: "12px", fontWeight: "700", color: "#059669", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "2px" }}
              >
                Lihat Catatan <ChevronRight size={14} />
              </button>
            </div>

            <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid var(--border)", fontSize: "12.5px", color: "var(--text-dim)", lineHeight: "1.5" }}>
              <p style={{ marginBottom: "6px", fontWeight: "600", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Lightbulb size={14} color="#d97706" /> Otomatisasi Ringkasan Kuliah
              </p>
              <p>
                AI membaca obrolan dan modul kuliah dari grup WhatsApp, lalu mengekstrak poin penting, rumus, dan materi ujian untuk dipelajari kembali dengan cepat.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("summary")}
            className="kl-btn kl-btn-secondary"
            style={{ width: "100%", justifyContent: "space-between" }}
          >
            <span>Buka Rangkuman Materi</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Card 4: Quiz & Chat AI Section */}
        <div className="kl-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ padding: "8px", borderRadius: "10px", backgroundColor: "#ecfdf5", color: "#10b981" }}>
                  <BotMessageSquare size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>Tanya AI & Latihan Kuis</h3>
                  <p style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>Asisten tanya-jawab & latihan soal</p>
                </div>
              </div>
            </div>

            <div style={{ padding: "20px", borderRadius: "12px", backgroundColor: "#f8fafc", border: "1px solid var(--border)", fontSize: "12.5px", color: "var(--text-dim)", lineHeight: "1.5" }}>
              <p style={{ marginBottom: "6px", fontWeight: "600", color: "var(--text-main)", display: "flex", alignItems: "center", gap: "6px" }}>
                <Bot size={14} color="#10b981" /> Asisten Mahasiswa Cerdas
              </p>
              <p>
                Tanyakan apa saja seputar materi dosen, informasi ujian, atau coba latihan kuis pilihan ganda yang disiapkan khusus untuk kelas <strong>{groupName}</strong>.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => setActiveTab("chatai")}
              className="kl-btn kl-btn-primary"
              style={{ flex: 1 }}
            >
              <Sparkles size={14} />
              <span>Tanya AI Kelas</span>
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className="kl-btn kl-btn-secondary"
              style={{ flex: 1 }}
            >
              <BrainCircuit size={14} />
              <span>Buka Kuis</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
