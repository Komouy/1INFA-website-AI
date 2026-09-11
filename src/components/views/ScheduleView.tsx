"use client";

import React, { useState } from "react";
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  User, 
  Video, 
  Info,
  Inbox,
  Globe,
  RefreshCw,
  Building2
} from "lucide-react";
import { ScheduleItem } from "@/types";

interface ScheduleViewProps {
  schedules: ScheduleItem[];
  searchQuery: string;
}

export default function ScheduleView({ schedules, searchQuery }: ScheduleViewProps) {
  const [selectedDay, setSelectedDay] = useState<string>("all");
  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

  const filteredSchedules = schedules.filter((item) => {
    const matchesSearch = 
      !searchQuery ||
      item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lecturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.room.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedDay !== "all" && item.day !== selectedDay) return false;
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
            backgroundColor: "#ecfeff",
            color: "#0891b2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <CalendarDays size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
              Jadwal Perkuliahan & Ruangan
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
              Sinkronisasi jadwal, ruang kuliah, dan link daring dari chat WhatsApp
            </p>
          </div>
        </div>

        {/* Day Pills */}
        <div style={{ display: "flex", gap: "4px", backgroundColor: "#f1f5f9", padding: "4px", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <button
            onClick={() => setSelectedDay("all")}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: selectedDay === "all" ? "700" : "500",
              backgroundColor: selectedDay === "all" ? "var(--primary)" : "transparent",
              color: selectedDay === "all" ? "#fff" : "var(--text-dim)",
              border: "none",
              cursor: "pointer"
            }}
          >
            Semua
          </button>
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: selectedDay === d ? "700" : "500",
                backgroundColor: selectedDay === d ? "var(--primary)" : "transparent",
                color: selectedDay === d ? "#fff" : "var(--text-dim)",
                border: "none",
                cursor: "pointer"
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="kl-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "16px",
            backgroundColor: "#f1f5f9",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px auto",
            color: "#94a3b8"
          }}>
            <Inbox size={24} />
          </div>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
            Belum Ada Jadwal Kuliah Terdaftar
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-dim)", maxWidth: "420px", margin: "0 auto", lineHeight: "1.5" }}>
            Jadwal perkuliahan dan link daring akan otomatis terisi saat pengumuman jadwal atau tautan Zoom dikirimkan di grup WhatsApp.
          </p>
        </div>
      ) : (
        <div className="kl-grid-3">
          {filteredSchedules.map((item) => (
            <div
              key={item.id}
              className="kl-card"
              style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "700", padding: "3px 8px", borderRadius: "6px", backgroundColor: "#f1f5f9", color: "var(--text-main)", border: "1px solid var(--border)" }}>
                    {item.day}
                  </span>

                  <span className={`kl-badge ${item.status === "online" ? "kl-badge-info" : item.status === "rescheduled" ? "kl-badge-warning" : "kl-badge-success"}`} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    {item.status === "online" ? <><Globe size={11} /> Daring Zoom</> : item.status === "rescheduled" ? <><RefreshCw size={11} /> Digeser</> : <><Building2 size={11} /> Tatap Muka</>}
                  </span>
                </div>

                <span style={{ fontSize: "10.5px", fontFamily: "monospace", color: "#047857", fontWeight: "600" }}>
                  {item.code} · {item.sks} SKS
                </span>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)", marginTop: "2px", marginBottom: "12px" }}>
                  {item.course}
                </h3>

                <div style={{
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "12px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)" }}>
                      <Clock size={13} color="#059669" />
                      <span>Waktu:</span>
                    </div>
                    <span style={{ fontWeight: "700", color: "var(--text-main)", fontFamily: "monospace" }}>
                      {item.startTime} - {item.endTime} WIB
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)" }}>
                      <MapPin size={13} color="#0891b2" />
                      <span>Lokasi:</span>
                    </div>
                    <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>
                      {item.room}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "6px", borderTop: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-dim)" }}>
                      <User size={13} color="#d97706" />
                      <span>Dosen:</span>
                    </div>
                    <span style={{ color: "var(--text-muted)", fontWeight: "500" }}>
                      {item.lecturer}
                    </span>
                  </div>
                </div>
              </div>

              {item.meetLink && (
                <a
                  href={item.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="kl-btn kl-btn-primary"
                  style={{ width: "100%", textDecoration: "none", fontSize: "12px", padding: "8px" }}
                >
                  <Video size={14} />
                  <span>Masuk Link Zoom Kuliah</span>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
