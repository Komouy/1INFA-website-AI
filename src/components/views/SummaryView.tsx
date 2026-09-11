"use client";

import React, { useState } from "react";
import { 
  BookOpenCheck, 
  Copy, 
  Check, 
  Lightbulb, 
  Inbox
} from "lucide-react";
import { CourseSummary, Message } from "@/types";

interface SummaryViewProps {
  summaries: CourseSummary[];
  searchQuery: string;
  messages: Message[];
}

export default function SummaryView({ summaries, searchQuery, messages }: SummaryViewProps) {
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const courses = Array.from(new Set(summaries.map((s) => s.course)));

  const filteredSummaries = summaries.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.topic.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedCourse !== "all" && item.course !== selectedCourse) return false;
    return true;
  });

  const handleCopy = (summary: CourseSummary) => {
    const text = `📚 Rangkuman 1INFA - ${summary.course}\nTopik: ${summary.topic} (${summary.date})\n\nPoin Utama:\n${summary.keyPoints.map((k) => `• ${k}`).join("\n")}\n\nAction Items:\n${summary.actionItems.map((a) => `✓ ${a}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopiedId(summary.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div className="kl-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            backgroundColor: "#fef3c7",
            color: "#d97706",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <BookOpenCheck size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
              Rangkuman Materi & Catatan Kuliah AI
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
              AI merangkum materi dan penjelasan dosen yang dikirim ke grup WhatsApp
            </p>
          </div>
        </div>
      </div>

      {summaries.length === 0 ? (
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
            Belum Ada Rangkuman Materi
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-dim)", maxWidth: "420px", margin: "0 auto", lineHeight: "1.5" }}>
            Saat ada obrolan penjelasan materi atau file materi yang masuk di grup WhatsApp, AI akan mengekstrak poin-poin penting kuliah di sini.
          </p>
          <div style={{ marginTop: "16px", fontSize: "11.5px", color: "var(--text-dim)" }}>
            Total pesan tersimpan saat ini: <strong>{messages.length} pesan</strong>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredSummaries.map((summary) => (
            <div key={summary.id} className="kl-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", paddingBottom: "12px", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span className="kl-badge kl-badge-warning">{summary.course}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-dim)" }}>📅 {summary.date}</span>
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
                    {summary.topic}
                  </h3>
                </div>

                <button
                  onClick={() => handleCopy(summary)}
                  className="kl-btn kl-btn-secondary"
                  style={{ padding: "6px 12px", fontSize: "12px" }}
                >
                  {copiedId === summary.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  <span>{copiedId === summary.id ? "Tersalin" : "Salin Catatan"}</span>
                </button>
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "700", color: "#b45309", marginBottom: "8px" }}>
                  <Lightbulb size={14} />
                  <span>Poin-Poin Kunci Pembahasan:</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {summary.keyPoints.map((point, i) => (
                    <div key={i} style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor: "#f8fafc",
                      border: "1px solid var(--border)",
                      fontSize: "12.5px",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "8px"
                    }}>
                      <span style={{ color: "#10b981", fontWeight: "700" }}>•</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
