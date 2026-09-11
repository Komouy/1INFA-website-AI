"use client";

import React, { useState } from "react";
import { 
  ClockAlert, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  Clock,
  MessageSquare,
  AlertOctagon,
  AlertTriangle,
  User
} from "lucide-react";
import { TaskDeadline } from "@/types";
import { Trash2 } from "lucide-react";

interface DeadlineViewProps {
  deadlines: TaskDeadline[];
  onAddTask: (task: Omit<TaskDeadline, "id">) => Promise<void>;
  onToggleComplete: (id: string, currentStatus: "pending" | "in_progress" | "completed") => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  searchQuery: string;
}

export default function DeadlineView({
  deadlines,
  onAddTask,
  onToggleComplete,
  onDeleteTask,
  searchQuery
}: DeadlineViewProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCourse, setFilterCourse] = useState<string>("all");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCourse, setNewTaskCourse] = useState("Informatika");
  const [newTaskDate, setNewTaskDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  });
  const [newTaskTime, setNewTaskTime] = useState("23:59");
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("high");

  const handleToggle = async (task: TaskDeadline) => {
    try {
      await onToggleComplete(task.id, task.status);
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Hapus tugas ini untuk semua mahasiswa?")) {
      try {
        await onDeleteTask(id);
      } catch (err) {
        console.error("Gagal menghapus tugas:", err);
      }
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddTask({
        title: newTaskTitle.trim(),
        course: newTaskCourse.trim(),
        dueDate: newTaskDate,
        dueTime: newTaskTime,
        priority: newTaskPriority,
        status: "pending",
        sourceMessage: "Ditambahkan manual oleh mahasiswa",
        type: "tugas_individu"
      });
      setNewTaskTitle("");
      setIsAddingTask(false);
    } catch (err) {
      console.error("Gagal menambah tugas:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const courses = Array.from(new Set(deadlines.map(d => d.course)));

  const filteredTasks = deadlines.filter((task) => {
    const matchesSearch = 
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.course.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "pending" && task.status === "completed") return false;
    if (filterStatus === "completed" && task.status !== "completed") return false;
    if (filterCourse !== "all" && task.course !== filterCourse) return false;

    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div className="kl-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            backgroundColor: "#ffe4e6",
            color: "#e11d48",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <ClockAlert size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
              Tracker Deadline & Tugas Kuliah
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
              Tugas & tenggat waktu terdeteksi otomatis dari pengumuman dosen di grup WhatsApp
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingTask(!isAddingTask)}
          className="kl-btn kl-btn-primary"
        >
          <Plus size={16} />
          <span>Tambah Tugas Baru</span>
        </button>
      </div>

      {/* Add Task Form */}
      {isAddingTask && (
        <form onSubmit={handleCreateTask} className="kl-card" style={{ display: "flex", flexDirection: "column", gap: "16px", borderColor: "var(--primary)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)" }}>Form Tambah Tugas</span>
            <button 
              type="button" 
              onClick={() => setIsAddingTask(false)}
              style={{ background: "none", border: "none", color: "var(--text-dim)", cursor: "pointer", fontSize: "12px" }}
            >
              Batal
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Judul Tugas</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Contoh: Laporan Praktikum Modul 5"
                className="kl-input"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Mata Kuliah</label>
              <input
                type="text"
                required
                placeholder="Nama Mata Kuliah..."
                value={newTaskCourse}
                onChange={(e) => setNewTaskCourse(e.target.value)}
                className="kl-input"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Deadline Tanggal</label>
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="kl-input"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button type="submit" disabled={isSubmitting} className="kl-btn kl-btn-primary">
              {isSubmitting ? "Menyimpan..." : "Simpan Tugas"}
            </button>
          </div>
        </form>
      )}

      {/* Filter Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setFilterStatus("all")}
            className={`kl-btn ${filterStatus === "all" ? "kl-btn-primary" : "kl-btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            Semua ({deadlines.length})
          </button>
          <button
            onClick={() => setFilterStatus("pending")}
            className={`kl-btn ${filterStatus === "pending" ? "kl-btn-primary" : "kl-btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            Belum Selesai ({deadlines.filter(d => d.status !== "completed").length})
          </button>
          <button
            onClick={() => setFilterStatus("completed")}
            className={`kl-btn ${filterStatus === "completed" ? "kl-btn-primary" : "kl-btn-secondary"}`}
            style={{ padding: "6px 14px", fontSize: "12px" }}
          >
            Selesai ({deadlines.filter(d => d.status === "completed").length})
          </button>
        </div>

        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="kl-input"
          style={{ height: "36px", fontSize: "12px" }}
        >
          <option value="all">Semua Mata Kuliah</option>
          {courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Tasks Grid */}
      {deadlines.length === 0 ? (
        <div className="kl-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>
            Belum Ada Tugas / Deadline
          </p>
          <p style={{ fontSize: "12px", color: "var(--text-dim)" }}>
            Tugas akan tercatat otomatis saat dosen memberikan instruksi tugas di grup WhatsApp.
          </p>
        </div>
      ) : (
        <div className="kl-grid-2">
          {filteredTasks.map((task) => {
            const isDone = task.status === "completed";
            return (
              <div
                key={task.id}
                className="kl-card"
                style={{
                  opacity: isDone ? 0.6 : 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "16px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "#047857", textTransform: "uppercase" }}>
                      {task.course}
                    </span>
                    <span className={`kl-badge ${task.priority === "high" ? "kl-badge-danger" : "kl-badge-warning"}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      {task.priority === "high" ? <><AlertOctagon size={11} /> Prioritas Tinggi</> : <><AlertTriangle size={11} /> Sedang</>}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", textDecoration: isDone ? "line-through" : "none", marginBottom: "8px" }}>
                    {task.title}
                  </h3>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "12px", color: "var(--text-dim)", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={13} color="#e11d48" />
                      <span>{task.dueDate}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={13} color="#d97706" />
                      <span>{task.dueTime} WIB</span>
                    </div>
                  </div>

                  {task.sourceMessage && (
                    <div style={{
                      padding: "10px 12px",
                      borderRadius: "10px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid var(--border)",
                      fontSize: "11.5px",
                      color: "var(--text-dim)"
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#15803d", fontWeight: "700", marginBottom: "2px" }}>
                        <MessageSquare size={12} />
                        <span>Terdeteksi di WhatsApp:</span>
                      </div>
                      <p style={{ fontStyle: "italic", color: "var(--text-muted)" }}>
                        "{task.sourceMessage}"
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "12px", borderTop: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-dim)", display: "flex", alignItems: "center", gap: "4px" }}>
                    {task.lecturer ? <><User size={11} /> {task.lecturer}</> : "Tugas Kelas"}
                  </span>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <button
                      onClick={() => handleDelete(task.id)}
                      title="Hapus Tugas"
                      style={{
                        padding: "6px",
                        borderRadius: "8px",
                        border: "1px solid #fee2e2",
                        backgroundColor: "#fef2f2",
                        color: "#ef4444",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Trash2 size={13} />
                    </button>

                    <button
                      onClick={() => handleToggle(task)}
                      className={`kl-btn ${isDone ? "kl-btn-secondary" : "kl-btn-primary"}`}
                      style={{ padding: "6px 12px", fontSize: "11.5px" }}
                    >
                      <CheckCircle2 size={13} />
                      <span>{isDone ? "Batal Selesai" : "Tandai Selesai"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
