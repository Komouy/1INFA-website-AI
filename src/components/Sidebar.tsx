"use client";

import React from "react";
import { 
  LayoutDashboard, 
  BrainCircuit, 
  BookOpenCheck, 
  CalendarDays, 
  BotMessageSquare, 
  ClockAlert, 
  GraduationCap,
  Megaphone,
  X
} from "lucide-react";
import { NavTab } from "@/types";

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  unreadDeadlinesCount: number;
  quizCount: number;
  groupName?: string;
  messageCount?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  unreadDeadlinesCount,
  quizCount,
  groupName = "1INFA - Angkatan 2026",
  messageCount = 0,
  isOpenMobile = false,
  onCloseMobile
}: SidebarProps) {
  const menuItems = [
    {
      id: "overview" as NavTab,
      label: "Ringkasan Kelas",
      icon: LayoutDashboard,
      badge: undefined,
      badgeType: "kl-badge-success"
    },
    {
      id: "bulletin" as NavTab,
      label: "Papan Info & Kas",
      icon: Megaphone,
      badge: "Info",
      badgeType: "kl-badge-success"
    },
    {
      id: "deadlines" as NavTab,
      label: "Reminder & Deadline",
      icon: ClockAlert,
      badge: unreadDeadlinesCount > 0 ? `${unreadDeadlinesCount}` : undefined,
      badgeType: "kl-badge-danger"
    },
    {
      id: "schedule" as NavTab,
      label: "Jadwal Kuliah",
      icon: CalendarDays,
      badge: undefined,
      badgeType: "kl-badge-info"
    },
    {
      id: "summary" as NavTab,
      label: "Rangkuman AI",
      icon: BookOpenCheck,
      badge: undefined,
      badgeType: "kl-badge-warning"
    },
    {
      id: "quiz" as NavTab,
      label: "Quiz & Latihan",
      icon: BrainCircuit,
      badge: quizCount > 0 ? `${quizCount}` : undefined,
      badgeType: "kl-badge-primary"
    },
    {
      id: "chatai" as NavTab,
      label: "Tanya AI Kelas",
      icon: BotMessageSquare,
      badge: "AI",
      badgeType: "kl-badge-primary"
    }
  ];

  const handleNavClick = (tabId: NavTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Backdrop for Mobile Drawer */}
      <div 
        className={`kl-sidebar-backdrop ${isOpenMobile ? "open" : ""}`}
        onClick={onCloseMobile}
        aria-hidden={!isOpenMobile}
      />

      <aside className={`kl-sidebar ${isOpenMobile ? "open" : ""}`}>
        {/* ── Top section: brand + nav ── */}
        <div>
          {/* Brand Header & Mobile Close */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", padding: "0 4px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
              }}>
                <GraduationCap size={22} />
              </div>
              <div>
                <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.4px" }}>
                  1INFA
                </span>
                <p style={{ fontSize: "11px", color: "var(--text-dim)", marginTop: "1px" }}>
                  Informatika A Hub
                </p>
              </div>
            </div>

            {/* Close button — only visible on mobile */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="kl-mobile-close-btn"
                title="Tutup Menu"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* WhatsApp Bot Status Box */}
          <div style={{
            padding: "12px 14px",
            borderRadius: "12px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            marginBottom: "20px"
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#15803d" }}>Bot Terhubung</span>
              </div>
              <span style={{ fontSize: "10px", color: "#16a34a", fontFamily: "monospace", fontWeight: "600" }}>Firestore Live</span>
            </div>
            <p style={{ fontSize: "11px", color: "#374151", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Grup: <strong>{groupName}</strong>
            </p>
            <div style={{ marginTop: "6px", fontSize: "10.5px", color: "var(--text-dim)" }}>
              Pesan terproses: <strong>{messageCount} chat</strong>
            </div>
          </div>

          {/* Navigation List */}
          <div>
            <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.8px", color: "#94a3b8", padding: "0 8px 10px 8px" }}>
              Menu Utama
            </p>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`kl-nav-item ${isActive ? "active" : ""}`}
                >
                  <Icon size={18} className="kl-nav-icon" />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span className={`kl-badge ${item.badgeType}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Bottom: user info card ── */}
        <div style={{
          padding: "12px 14px",
          borderRadius: "12px",
          backgroundColor: "#f8fafc",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              backgroundColor: "#dcfce7",
              color: "#166534",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "700"
            }}>
              26
            </div>
            <div>
              <p style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-main)" }}>Kelas 1INFA</p>
              <p style={{ fontSize: "11px", color: "var(--text-dim)" }}>Angkatan 2026</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
