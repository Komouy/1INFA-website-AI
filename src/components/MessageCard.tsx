"use client";

import React, { useState } from "react";
import { Message } from "@/types";
import { 
  FileText, 
  Image as ImageIcon, 
  Paperclip, 
  Copy, 
  Check
} from "lucide-react";

interface MessageCardProps {
  message: Message;
}

function formatTime(dateVal: Date | string | number | undefined): string {
  if (!dateVal) return "";
  const date = dateVal instanceof Date ? dateVal : new Date(dateVal);
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const timeStr = date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return timeStr;

  return (
    date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) +
    " · " +
    timeStr
  );
}

function getInitials(name: string): string {
  if (!name) return "WA";
  return name
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "WA";
}

function getSenderRole(name: string): { label: string; bg: string; color: string } | null {
  if (!name) return null;
  const lower = name.toLowerCase();
  if (lower.includes("pak ") || lower.includes("bu ") || lower.includes("dosen") || lower.includes("dr.") || lower.includes("prof")) {
    return { label: "Dosen", bg: "#fef3c7", color: "#b45309" };
  }
  if (lower.includes("komti") || lower.includes("ketua") || lower.includes("admin")) {
    return { label: "Komti", bg: "#dcfce7", color: "#15803d" };
  }
  return null;
}

export default function MessageCard({ message }: MessageCardProps) {
  const [copied, setCopied] = useState(false);
  const initials = getInitials(message.sender_name);
  const role = getSenderRole(message.sender_name);
  const time = formatTime(message.timestamp);

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      padding: "14px 16px",
      borderRadius: "14px",
      backgroundColor: "#ffffff",
      border: "1px solid var(--border)",
      display: "flex",
      gap: "12px",
      alignItems: "flex-start",
      boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.03)"
    }}>
      {/* Avatar */}
      <div style={{
        width: "36px",
        height: "36px",
        borderRadius: "10px",
        backgroundColor: "#dcfce7",
        color: "#15803d",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "700",
        flexShrink: 0
      }}>
        {initials}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>
              {message.sender_name || "Anonim"}
            </span>
            {role && (
              <span style={{
                fontSize: "10px",
                fontWeight: "700",
                padding: "2px 6px",
                borderRadius: "6px",
                backgroundColor: role.bg,
                color: role.color
              }}>
                {role.label}
              </span>
            )}
          </div>
          {time && (
            <span style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "monospace" }}>
              {time}
            </span>
          )}
        </div>

        {/* Message Text */}
        {message.content && (
          <p style={{
            fontSize: "13px",
            color: "var(--text-muted)",
            lineHeight: "1.55",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word"
          }}>
            {message.content}
          </p>
        )}

        {/* Media Badge */}
        {message.media_type && message.media_type !== "text" && (
          <div style={{
            marginTop: "8px",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "8px",
            backgroundColor: "#ecfdf5",
            color: "#047857",
            fontSize: "11px",
            fontWeight: "600",
            border: "1px solid #a7f3d0"
          }}>
            {message.media_type === "image" ? (
              <ImageIcon size={13} />
            ) : (
              <FileText size={13} />
            )}
            <span>{message.media_url ? message.media_url : `Lampiran ${message.media_type}`}</span>
          </div>
        )}

        {/* Copy Button */}
        {message.content && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
            <button
              onClick={handleCopy}
              title="Salin pesan"
              style={{
                background: "transparent",
                border: "none",
                color: copied ? "#10b981" : "var(--text-dim)",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: "500"
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied && <span>Tersalin</span>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
