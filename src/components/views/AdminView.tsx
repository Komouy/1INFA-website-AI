"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Sparkles,
  Send,
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  BookOpenCheck,
  BrainCircuit,
  Megaphone,
  CheckSquare,
  Square,
  RefreshCw,
  Search,
  ExternalLink
} from "lucide-react";
import { Message, TaskDeadline, ScheduleItem, BulletinItem, CourseSummary, QuizSet } from "@/types";
import { executeAdminAICommand, AdminAIAction } from "@/services/aiService";

interface AdminViewProps {
  messages: Message[];
  deadlines: TaskDeadline[];
  schedules: ScheduleItem[];
  bulletins: BulletinItem[];
  summaries: CourseSummary[];
  quizzes: QuizSet[];
  onDeleteMessage: (id: string) => Promise<void>;
  onBulkDeleteMessages: (ids: string[]) => Promise<void>;
  onDeleteDeadline: (id: string) => Promise<void>;
  onAddDeadline: (task: Omit<TaskDeadline, "id">) => Promise<void>;
  onClearCompletedDeadlines: () => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  onAddSchedule: (schedule: Omit<ScheduleItem, "id">) => Promise<void>;
  onUpdateScheduleStatus: (id: string, status: ScheduleItem["status"]) => Promise<void>;
  onDeleteBulletin: (id: string) => Promise<void>;
  onAddBulletin: (item: Omit<BulletinItem, "id">) => Promise<void>;
  onDeleteSummary: (id: string) => Promise<void>;
  onDeleteQuiz: (id: string) => Promise<void>;
  onAddQuiz: (quiz: Omit<QuizSet, "id">) => Promise<void>;
}

type AdminSubTab = "messages" | "ai-command" | "deadlines" | "schedules" | "bulletins" | "content";

const DEFAULT_PIN = "1infa2026";
const BACKUP_PIN = "1234";

export default function AdminView({
  messages,
  deadlines,
  schedules,
  bulletins,
  summaries,
  quizzes,
  onDeleteMessage,
  onBulkDeleteMessages,
  onDeleteDeadline,
  onAddDeadline,
  onClearCompletedDeadlines,
  onDeleteSchedule,
  onAddSchedule,
  onUpdateScheduleStatus,
  onDeleteBulletin,
  onAddBulletin,
  onDeleteSummary,
  onDeleteQuiz,
  onAddQuiz,
}: AdminViewProps) {
  // ─── PIN Auth State ──────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("1infa_admin_session") === "true";
    } catch {
      return false;
    }
  });

  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  // ─── Sub-tabs State ──────────────────────────────────────────────────────────
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>("messages");

  // ─── Messages Select & Delete State ──────────────────────────────────────────
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([]);
  const [msgSearchQuery, setMsgSearchQuery] = useState("");
  const [isDeletingMsgs, setIsDeletingMsgs] = useState(false);

  // ─── AI Command State ────────────────────────────────────────────────────────
  const [aiPrompt, setAiPrompt] = useState("");
  const [isExecutingAI, setIsExecutingAI] = useState(false);
  const [aiExecutionResult, setAiExecutionResult] = useState<{
    explanation: string;
    appliedCount: number;
  } | null>(null);

  // ─── Form New Schedule ───────────────────────────────────────────────────────
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);
  const [newSchDay, setNewSchDay] = useState<ScheduleItem["day"]>("Senin");
  const [newSchCourse, setNewSchCourse] = useState("");
  const [newSchCode, setNewSchCode] = useState("IF");
  const [newSchLecturer, setNewSchLecturer] = useState("");
  const [newSchStartTime, setNewSchStartTime] = useState("08:00");
  const [newSchEndTime, setNewSchEndTime] = useState("10:30");
  const [newSchRoom, setNewSchRoom] = useState("Lab Komputer");
  const [newSchSks, setNewSchSks] = useState(3);
  const [newSchStatus, setNewSchStatus] = useState<ScheduleItem["status"]>("normal");
  const [newSchNotes, setNewSchNotes] = useState("");
  const [newSchMeetLink, setNewSchMeetLink] = useState("");

  // ─── Form New Bulletin ───────────────────────────────────────────────────────
  const [isAddingBulletin, setIsAddingBulletin] = useState(false);
  const [newBulTitle, setNewBulTitle] = useState("");
  const [newBulCategory, setNewBulCategory] = useState<BulletinItem["category"]>("pengumuman");
  const [newBulContent, setNewBulContent] = useState("");
  const [newBulTag, setNewBulTag] = useState("");
  const [newBulHighlight, setNewBulHighlight] = useState("");

  // ─── Handlers Login / Logout ─────────────────────────────────────────────────
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === DEFAULT_PIN || pinInput.trim() === BACKUP_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
      try {
        sessionStorage.setItem("1infa_admin_session", "true");
      } catch {}
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput("");
    try {
      sessionStorage.removeItem("1infa_admin_session");
    } catch {}
  };

  // ─── Filtered Messages ───────────────────────────────────────────────────────
  const filteredMessages = messages.filter((m) => {
    if (!msgSearchQuery) return true;
    const q = msgSearchQuery.toLowerCase();
    return (
      (m.sender_name && m.sender_name.toLowerCase().includes(q)) ||
      (m.content && m.content.toLowerCase().includes(q))
    );
  });

  const isAllSelected =
    filteredMessages.length > 0 &&
    filteredMessages.every((m) => selectedMessageIds.includes(m.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedMessageIds([]);
    } else {
      setSelectedMessageIds(filteredMessages.map((m) => m.id));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    if (selectedMessageIds.includes(id)) {
      setSelectedMessageIds(selectedMessageIds.filter((item) => item !== id));
    } else {
      setSelectedMessageIds([...selectedMessageIds, id]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedMessageIds.length === 0) return;
    if (
      !window.confirm(
        `Yakin ingin menghapus ${selectedMessageIds.length} pesan terpilih dari Firestore? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    setIsDeletingMsgs(true);
    try {
      await onBulkDeleteMessages(selectedMessageIds);
      setSelectedMessageIds([]);
    } catch (err) {
      console.error("Gagal hapus pesan terpilih:", err);
      alert("Gagal menghapus beberapa pesan.");
    } finally {
      setIsDeletingMsgs(false);
    }
  };

  const handleDeleteSingleMsg = async (id: string) => {
    if (!window.confirm("Hapus pesan ini dari Firestore?")) return;
    try {
      await onDeleteMessage(id);
      setSelectedMessageIds((prev) => prev.filter((item) => item !== id));
    } catch (err) {
      console.error("Gagal menghapus pesan:", err);
      alert("Gagal menghapus pesan.");
    }
  };

  // ─── AI Command Execution ────────────────────────────────────────────────────
  const handleExecuteAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsExecutingAI(true);
    setAiExecutionResult(null);

    try {
      const result = await executeAdminAICommand(aiPrompt.trim(), {
        deadlines,
        schedules,
      });

      let applied = 0;
      for (const act of result.actions) {
        if (act.type === "ADD_SCHEDULE" && act.payload) {
          await onAddSchedule(act.payload);
          applied++;
        } else if (act.type === "ADD_DEADLINE" && act.payload) {
          await onAddDeadline(act.payload);
          applied++;
        } else if (act.type === "ADD_BULLETIN" && act.payload) {
          await onAddBulletin(act.payload);
          applied++;
        } else if (act.type === "ADD_QUIZ" && act.payload) {
          await onAddQuiz(act.payload);
          applied++;
        } else if (act.type === "CLEAR_COMPLETED_DEADLINES") {
          await onClearCompletedDeadlines();
          applied++;
        }
      }

      setAiExecutionResult({
        explanation: result.explanation,
        appliedCount: applied,
      });
      setAiPrompt("");
    } catch (err: any) {
      console.error("Gagal mengeksekusi perintah AI:", err);
      alert(`Gagal: ${err.message || "Terjadi kesalahan pada AI engine."}`);
    } finally {
      setIsExecutingAI(false);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchCourse.trim()) return;

    try {
      await onAddSchedule({
        day: newSchDay,
        course: newSchCourse.trim(),
        code: newSchCode.trim() || "IF2100",
        lecturer: newSchLecturer.trim() || "Dosen Pengampu",
        startTime: newSchStartTime,
        endTime: newSchEndTime,
        room: newSchRoom.trim() || "Lab Komputer",
        sks: Number(newSchSks) || 3,
        status: newSchStatus,
        notes: newSchNotes.trim() || undefined,
        meetLink: newSchMeetLink.trim() || undefined,
      });
      setNewSchCourse("");
      setIsAddingSchedule(false);
    } catch (err) {
      console.error("Gagal menambah jadwal:", err);
    }
  };

  const handleCreateBulletin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBulTitle.trim()) return;

    try {
      await onAddBulletin({
        title: newBulTitle.trim(),
        category: newBulCategory,
        content: newBulContent.trim(),
        tag: newBulTag.trim() || undefined,
        highlight: newBulHighlight.trim() || undefined,
      });
      setNewBulTitle("");
      setNewBulContent("");
      setIsAddingBulletin(false);
    } catch (err) {
      console.error("Gagal menambah info bulletin:", err);
    }
  };

  // ─── RENDER: Layar Kunci PIN (Jika Belum Login) ───────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "65vh" }}>
        <div
          className="kl-card"
          style={{
            maxWidth: "420px",
            width: "100%",
            textAlign: "center",
            padding: "40px 28px",
            borderRadius: "20px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              backgroundColor: "#fef3c7",
              color: "#d97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px auto",
            }}
          >
            <Lock size={28} />
          </div>

          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "var(--text-main)", marginBottom: "6px" }}>
            Panel Administrator
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-dim)", lineHeight: "1.5", marginBottom: "24px" }}>
            Area ini khusus untuk pengurus kelas 1INFA. Masukkan PIN keamanan untuk mengelola database dan memberi instruksi AI.
          </p>

          <form onSubmit={handlePinSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <input
                type="password"
                placeholder="Masukkan PIN Admin..."
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                className="kl-input"
                style={{
                  width: "100%",
                  textAlign: "center",
                  fontSize: "18px",
                  letterSpacing: "4px",
                  borderColor: pinError ? "#ef4444" : undefined,
                }}
                autoFocus
              />
              {pinError && (
                <p style={{ fontSize: "12px", color: "#ef4444", marginTop: "6px", fontWeight: "500" }}>
                  PIN salah. Silakan coba lagi. (Default: <code>1infa2026</code>)
                </p>
              )}
            </div>

            <button type="submit" className="kl-btn kl-btn-primary" style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
              <Unlock size={16} />
              <span>Buka Akses Admin</span>
            </button>
          </form>

          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)", fontSize: "11px", color: "var(--text-dim)" }}>
            Default PIN: <strong style={{ color: "var(--text-main)" }}>1infa2026</strong> atau <strong style={{ color: "var(--text-main)" }}>1234</strong>
          </div>
        </div>
      </div>
    );
  }

  // ─── RENDER: Admin Panel Utama (Setelah Login) ────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Admin Header Banner */}
      <div
        className="kl-card"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          color: "#fff",
          borderColor: "#334155",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "#38bdf8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#fff" }}>
                Panel Administrator 1INFA
              </h2>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "700",
                  padding: "2px 6px",
                  borderRadius: "6px",
                  backgroundColor: "#0284c7",
                  color: "#fff",
                }}
              >
                UNLOCKED
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "2px" }}>
              Kontrol penuh database Firestore: Hapus chat, kelola jadwal & tugas, serta perintahkan AI.
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="kl-btn"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            color: "#fca5a5",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            fontSize: "12px",
          }}
        >
          <Lock size={14} />
          <span>Kunci Admin (Logout)</span>
        </button>
      </div>

      {/* Admin Navigation Pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <button
          onClick={() => setActiveSubTab("messages")}
          className={`kl-btn ${activeSubTab === "messages" ? "kl-btn-primary" : "kl-btn-secondary"}`}
          style={{ fontSize: "12.5px" }}
        >
          <MessageSquare size={14} />
          <span>Hapus Pesan WA ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("ai-command")}
          className={`kl-btn ${activeSubTab === "ai-command" ? "kl-btn-primary" : "kl-btn-secondary"}`}
          style={{ fontSize: "12.5px" }}
        >
          <Sparkles size={14} />
          <span>🤖 Perintah AI Website</span>
        </button>

        <button
          onClick={() => setActiveSubTab("deadlines")}
          className={`kl-btn ${activeSubTab === "deadlines" ? "kl-btn-primary" : "kl-btn-secondary"}`}
          style={{ fontSize: "12.5px" }}
        >
          <Clock size={14} />
          <span>Kelola Tugas ({deadlines.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("schedules")}
          className={`kl-btn ${activeSubTab === "schedules" ? "kl-btn-primary" : "kl-btn-secondary"}`}
          style={{ fontSize: "12.5px" }}
        >
          <Calendar size={14} />
          <span>Kelola Jadwal ({schedules.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("bulletins")}
          className={`kl-btn ${activeSubTab === "bulletins" ? "kl-btn-primary" : "kl-btn-secondary"}`}
          style={{ fontSize: "12.5px" }}
        >
          <Megaphone size={14} />
          <span>Kelola Catatan ({bulletins.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("content")}
          className={`kl-btn ${activeSubTab === "content" ? "kl-btn-primary" : "kl-btn-secondary"}`}
          style={{ fontSize: "12.5px" }}
        >
          <BookOpenCheck size={14} />
          <span>Rangkuman & Kuis</span>
        </button>
      </div>

      {/* ─── TAB 1: KELOLA PESAN WA (SELECT & BULK DELETE) ───────────────────── */}
      {activeSubTab === "messages" && (
        <div className="kl-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>
                Hapus Pesan WhatsApp di Firestore
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                Pilih pesan yang ingin dihapus. Pesan yang dihapus akan seketika hilang dari feed dashboard.
              </p>
            </div>

            {/* Bulk Action Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                onClick={handleToggleSelectAll}
                className="kl-btn kl-btn-secondary"
                style={{ fontSize: "12px" }}
              >
                {isAllSelected ? <CheckSquare size={14} color="#10b981" /> : <Square size={14} />}
                <span>{isAllSelected ? "Batal Pilih Semua" : "Pilih Semua"}</span>
              </button>

              <button
                onClick={handleBulkDelete}
                disabled={selectedMessageIds.length === 0 || isDeletingMsgs}
                className="kl-btn kl-btn-primary"
                style={{
                  backgroundColor: selectedMessageIds.length > 0 ? "#ef4444" : undefined,
                  borderColor: selectedMessageIds.length > 0 ? "#ef4444" : undefined,
                  fontSize: "12px",
                  opacity: selectedMessageIds.length === 0 ? 0.6 : 1,
                }}
              >
                <Trash2 size={14} />
                <span>
                  {isDeletingMsgs
                    ? "Menghapus..."
                    : `Hapus Terpilih (${selectedMessageIds.length})`}
                </span>
              </button>
            </div>
          </div>

          {/* Search bar for messages */}
          <div style={{ position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "11px", color: "var(--text-dim)" }} />
            <input
              type="text"
              placeholder="Cari teks pesan atau pengirim..."
              value={msgSearchQuery}
              onChange={(e) => setMsgSearchQuery(e.target.value)}
              className="kl-input"
              style={{ width: "100%", paddingLeft: "36px", fontSize: "13px" }}
            />
          </div>

          {/* Messages Table / List */}
          {filteredMessages.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-dim)", fontSize: "13px" }}>
              Tidak ada pesan WhatsApp yang sesuai.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "550px", overflowY: "auto" }}>
              {filteredMessages.map((msg) => {
                const isSelected = selectedMessageIds.includes(msg.id);
                const timeStr = msg.timestamp ? new Date(msg.timestamp).toLocaleString("id-ID") : "";

                return (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      backgroundColor: isSelected ? "#fef2f2" : "#f8fafc",
                      border: isSelected ? "1px solid #fca5a5" : "1px solid var(--border)",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {/* Checkbox & Details */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectOne(msg.id)}
                        style={{ width: "18px", height: "18px", marginTop: "2px", cursor: "pointer", accentColor: "#ef4444" }}
                      />

                      <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "12.5px", fontWeight: "700", color: "var(--text-main)" }}>
                            {msg.sender_name || "Anonim"}
                          </span>
                          <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                            {timeStr}
                          </span>
                          {msg.group_name && (
                            <span style={{ fontSize: "10px", padding: "1px 6px", borderRadius: "4px", backgroundColor: "#e2e8f0", color: "#475569" }}>
                              {msg.group_name}
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: "13px", color: "var(--text-main)", lineHeight: "1.4", wordBreak: "break-word" }}>
                          {msg.content || (msg.media_type ? `[File/Media: ${msg.media_type}]` : "(Pesan kosong)")}
                        </p>
                      </div>
                    </div>

                    {/* Single Delete Button */}
                    <button
                      onClick={() => handleDeleteSingleMsg(msg.id)}
                      title="Hapus pesan ini"
                      style={{
                        padding: "6px",
                        borderRadius: "6px",
                        border: "1px solid #fee2e2",
                        backgroundColor: "#fff",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: AI COMMAND CENTER ────────────────────────────────────────── */}
      {activeSubTab === "ai-command" && (
        <div className="kl-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Sparkles size={18} color="#0284c7" />
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
                Pusat Kendali Perintah AI (Gemini 3.6 Flash)
              </h3>
            </div>
            <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>
              Ketik instruksi bahasa sehari-hari apa pun. AI akan memahami perintahmu dan langsung melakukan aksi penambahan/pengubahan data di database website.
            </p>
          </div>

          {/* Quick Command Suggestion Chips */}
          <div>
            <label style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
              💡 Contoh Perintah Sekali Klik:
            </label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {[
                "Tambahkan jadwal kuliah pengganti Pemrograman Web hari Sabtu jam 09:00-11:00 di Lab RPL",
                "Buatkan pengumuman uang kas baru sebesar Rp 20.000 untuk bulan depan ke bendahara Sarah",
                "Tambahkan deadline tugas Algoritma: Laporan Sorting, kumpul 4 hari lagi jam 23:59",
                "Hapus semua tugas yang sudah berstatus selesai",
                "Buatkan kuis latihan 5 soal tentang Relasi Database dan SQL JOIN",
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAiPrompt(chip)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "8px",
                    fontSize: "11.5px",
                    backgroundColor: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    color: "#0369a1",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input Area */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <textarea
              rows={3}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Contoh: Tambahkan jadwal kuliah pengganti hari Sabtu jam 08:00 untuk mata kuliah..."
              className="kl-input"
              style={{ width: "100%", fontSize: "13.5px", lineHeight: "1.5" }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleExecuteAI}
                disabled={isExecutingAI || !aiPrompt.trim()}
                className="kl-btn kl-btn-primary"
                style={{ padding: "10px 20px" }}
              >
                {isExecutingAI ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    <span>AI Sedang Memproses Perintah...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>Eksekusi Perintah ke Website</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Execution Result Box */}
          {aiExecutionResult && (
            <div
              style={{
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "#ecfdf5",
                border: "1px solid #a7f3d0",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#065f46", fontWeight: "700", fontSize: "13px" }}>
                <CheckCircle2 size={16} />
                <span>Berhasil Dieksekusi ({aiExecutionResult.appliedCount} Aksi Diterapkan)</span>
              </div>
              <p style={{ fontSize: "12.5px", color: "#047857", lineHeight: "1.5" }}>
                {aiExecutionResult.explanation}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: KELOLA TUGAS & DEADLINE ──────────────────────────────────── */}
      {activeSubTab === "deadlines" && (
        <div className="kl-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>
                Kelola Tugas & Deadline Kelas
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                Hapus tugas yang salah/usang atau bersihkan semua tugas yang sudah selesai.
              </p>
            </div>

            <button
              onClick={async () => {
                if (window.confirm("Hapus semua tugas yang statusnya sudah Selesai?")) {
                  await onClearCompletedDeadlines();
                }
              }}
              className="kl-btn kl-btn-secondary"
              style={{ fontSize: "12px", color: "#ef4444" }}
            >
              <Trash2 size={13} />
              <span>Bersihkan Tugas Selesai</span>
            </button>
          </div>

          {deadlines.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-dim)" }}>
              Tidak ada tugas terdaftar.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {deadlines.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", color: "#047857" }}>
                        {task.course}
                      </span>
                      <span className={`kl-badge ${task.status === "completed" ? "kl-badge-success" : "kl-badge-warning"}`}>
                        {task.status === "completed" ? "Selesai" : "Pending"}
                      </span>
                    </div>
                    <h4 style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-main)", marginTop: "3px" }}>
                      {task.title}
                    </h4>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                      Deadline: {task.dueDate} · {task.dueTime} WIB
                    </span>
                  </div>

                  <button
                    onClick={async () => {
                      if (window.confirm(`Hapus tugas "${task.title}"?`)) {
                        await onDeleteDeadline(task.id);
                      }
                    }}
                    style={{
                      padding: "6px 10px",
                      borderRadius: "6px",
                      border: "1px solid #fee2e2",
                      backgroundColor: "#fef2f2",
                      color: "#ef4444",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      fontSize: "12px",
                    }}
                  >
                    <Trash2 size={13} />
                    <span>Hapus</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: KELOLA JADWAL PERKULIAHAN ─────────────────────────────────── */}
      {activeSubTab === "schedules" && (
        <div className="kl-card" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>
                Daftar Jadwal Kuliah Mingguan
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                Tambah jadwal kuliah baru, ubah status tatap muka/daring, atau hapus jadwal dari Firestore.
              </p>
            </div>

            <button
              onClick={() => setIsAddingSchedule(!isAddingSchedule)}
              className="kl-btn kl-btn-primary"
              style={{ fontSize: "12px" }}
            >
              <Plus size={14} />
              <span>{isAddingSchedule ? "Tutup Form" : "Tambah Jadwal Baru"}</span>
            </button>
          </div>

          {/* Form Tambah Jadwal */}
          {isAddingSchedule && (
            <form
              onSubmit={handleCreateSchedule}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                border: "1px solid #bae6fd",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Hari</label>
                  <select
                    value={newSchDay}
                    onChange={(e) => setNewSchDay(e.target.value as any)}
                    className="kl-input"
                    style={{ width: "100%" }}
                  >
                    {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Mata Kuliah</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pemrograman Web Lanjut"
                    value={newSchCourse}
                    onChange={(e) => setNewSchCourse(e.target.value)}
                    className="kl-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Kode MK & SKS</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="text"
                      placeholder="IF2101"
                      value={newSchCode}
                      onChange={(e) => setNewSchCode(e.target.value)}
                      className="kl-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="number"
                      placeholder="3"
                      value={newSchSks}
                      onChange={(e) => setNewSchSks(Number(e.target.value))}
                      className="kl-input"
                      style={{ width: "60px" }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Dosen Pengampu</label>
                  <input
                    type="text"
                    placeholder="Nama dosen & gelar"
                    value={newSchLecturer}
                    onChange={(e) => setNewSchLecturer(e.target.value)}
                    className="kl-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Jam Mulai - Selesai</label>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <input
                      type="time"
                      value={newSchStartTime}
                      onChange={(e) => setNewSchStartTime(e.target.value)}
                      className="kl-input"
                      style={{ flex: 1 }}
                    />
                    <input
                      type="time"
                      value={newSchEndTime}
                      onChange={(e) => setNewSchEndTime(e.target.value)}
                      className="kl-input"
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Ruangan / Lokasi</label>
                  <input
                    type="text"
                    placeholder="Lab RPL / Ruang 304"
                    value={newSchRoom}
                    onChange={(e) => setNewSchRoom(e.target.value)}
                    className="kl-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Status Kuliah</label>
                  <select
                    value={newSchStatus}
                    onChange={(e) => setNewSchStatus(e.target.value as any)}
                    className="kl-input"
                    style={{ width: "100%" }}
                  >
                    <option value="normal">Tatap Muka Normal</option>
                    <option value="online">Daring Zoom / GMeet</option>
                    <option value="rescheduled">Digeser / Jadwal Pengganti</option>
                    <option value="cancelled">Diliburkan</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Link Daring (Opsional)</label>
                  <input
                    type="text"
                    placeholder="https://zoom.us/..."
                    value={newSchMeetLink}
                    onChange={(e) => setNewSchMeetLink(e.target.value)}
                    className="kl-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button type="button" onClick={() => setIsAddingSchedule(false)} className="kl-btn kl-btn-secondary">
                  Batal
                </button>
                <button type="submit" className="kl-btn kl-btn-primary">
                  Simpan Jadwal ke Firestore
                </button>
              </div>
            </form>
          )}

          {/* List Jadwal */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {schedules.map((sch) => (
              <div
                key={sch.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "700", padding: "2px 8px", borderRadius: "6px", backgroundColor: "#e2e8f0" }}>
                      {sch.day}
                    </span>
                    <span style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-main)" }}>
                      {sch.course}
                    </span>
                    <span style={{ fontSize: "11px", color: "#047857", fontWeight: "600" }}>
                      {sch.code} · {sch.sks} SKS
                    </span>
                  </div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-dim)", marginTop: "4px" }}>
                    {sch.startTime} - {sch.endTime} WIB · {sch.room} · Dosen: {sch.lecturer}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <select
                    value={sch.status}
                    onChange={(e) => onUpdateScheduleStatus(sch.id, e.target.value as any)}
                    className="kl-input"
                    style={{ fontSize: "11.5px", padding: "4px 8px", height: "32px" }}
                  >
                    <option value="normal">Tatap Muka</option>
                    <option value="online">Daring Zoom</option>
                    <option value="rescheduled">Digeser</option>
                    <option value="cancelled">Libur</option>
                  </select>

                  <button
                    onClick={async () => {
                      if (window.confirm(`Hapus jadwal "${sch.course}"?`)) {
                        await onDeleteSchedule(sch.id);
                      }
                    }}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid #fee2e2",
                      backgroundColor: "#fef2f2",
                      color: "#ef4444",
                      cursor: "pointer",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 5: KELOLA CATATAN BULLETIN ──────────────────────────────────── */}
      {activeSubTab === "bulletins" && (
        <div className="kl-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)" }}>
                Kelola Papan Info, Kas, & Pengumuman
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                Tambah atau hapus info kas, seragam PDH, atau pengumuman lainnya di Firestore.
              </p>
            </div>

            <button
              onClick={() => setIsAddingBulletin(!isAddingBulletin)}
              className="kl-btn kl-btn-primary"
              style={{ fontSize: "12px" }}
            >
              <Plus size={14} />
              <span>{isAddingBulletin ? "Tutup Form" : "Tambah Info Baru"}</span>
            </button>
          </div>

          {/* Form Tambah Bulletin */}
          {isAddingBulletin && (
            <form
              onSubmit={handleCreateBulletin}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                border: "1px solid #bae6fd",
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Judul Info</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pembayaran Uang Kas Semester 2"
                    value={newBulTitle}
                    onChange={(e) => setNewBulTitle(e.target.value)}
                    className="kl-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Kategori</label>
                  <select
                    value={newBulCategory}
                    onChange={(e) => setNewBulCategory(e.target.value as any)}
                    className="kl-input"
                    style={{ width: "100%" }}
                  >
                    <option value="kas">Uang Kas</option>
                    <option value="pdh">Baju PDH</option>
                    <option value="buku">Buku & Modul</option>
                    <option value="pengumuman">Pengumuman Umum</option>
                    <option value="random">Lain-lain</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Tag Singkat</label>
                  <input
                    type="text"
                    placeholder="Kas Kelas / Info PDH"
                    value={newBulTag}
                    onChange={(e) => setNewBulTag(e.target.value)}
                    className="kl-input"
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Highlight (Biaya/Status)</label>
                  <input
                    type="text"
                    placeholder="Rp 20.000 / Sesuai Instruksi"
                    value={newBulHighlight}
                    onChange={(e) => setNewBulHighlight(e.target.value)}
                    className="kl-input"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Isi Penjelasan Catatan</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail lengkap mengenai pengumuman atau pembayaran..."
                  value={newBulContent}
                  onChange={(e) => setNewBulContent(e.target.value)}
                  className="kl-input"
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                <button type="button" onClick={() => setIsAddingBulletin(false)} className="kl-btn kl-btn-secondary">
                  Batal
                </button>
                <button type="submit" className="kl-btn kl-btn-primary">
                  Simpan ke Firestore
                </button>
              </div>
            </form>
          )}

          {/* List Bulletin */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {bulletins.map((b) => (
              <div
                key={b.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid var(--border)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#0284c7" }}>
                      {b.category}
                    </span>
                    <h4 style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--text-main)" }}>
                      {b.title}
                    </h4>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
                    {b.content.slice(0, 120)}...
                  </p>
                </div>

                <button
                  onClick={async () => {
                    if (window.confirm(`Hapus catatan "${b.title}"?`)) {
                      await onDeleteBulletin(b.id);
                    }
                  }}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "6px",
                    border: "1px solid #fee2e2",
                    backgroundColor: "#fef2f2",
                    color: "#ef4444",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                  }}
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── TAB 6: KELOLA RANGKUMAN & KUIS ─────────────────────────────────── */}
      {activeSubTab === "content" && (
        <div className="kl-grid-2">
          {/* Kolom 1: Rangkuman */}
          <div className="kl-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>
              Daftar Rangkuman Kuliah AI ({summaries.length})
            </h3>
            {summaries.length === 0 ? (
              <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>Belum ada rangkuman tersimpan.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {summaries.map((s) => (
                  <div
                    key={s.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)" }}>
                        {s.course} - {s.topic}
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>{s.date}</div>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Hapus rangkuman "${s.topic}"?`)) {
                          await onDeleteSummary(s.id);
                        }
                      }}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "none", backgroundColor: "#fee2e2", color: "#ef4444", cursor: "pointer" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kolom 2: Kuis Latihan */}
          <div className="kl-card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>
              Daftar Kuis AI ({quizzes.length})
            </h3>
            {quizzes.length === 0 ? (
              <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>Belum ada kuis tersimpan.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {quizzes.map((q) => (
                  <div
                    key={q.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)" }}>
                        {q.title} ({q.course})
                      </div>
                      <div style={{ fontSize: "11px", color: "var(--text-dim)" }}>
                        {q.questions.length} Soal · {q.difficulty}
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (window.confirm(`Hapus kuis "${q.title}"?`)) {
                          await onDeleteQuiz(q.id);
                        }
                      }}
                      style={{ padding: "4px 8px", borderRadius: "6px", border: "none", backgroundColor: "#fee2e2", color: "#ef4444", cursor: "pointer" }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
