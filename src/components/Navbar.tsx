import React, { useState } from "react";
import { Search, RefreshCw, Sparkles, BrainCircuit, Menu, X } from "lucide-react";
import { NavTab } from "@/types";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onAnalyzeAI?: () => void;
  isAnalyzingAI?: boolean;
  groupName?: string;
  onOpenMobileNav?: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onRefresh,
  isRefreshing = false,
  onAnalyzeAI,
  isAnalyzingAI = false,
  groupName = "1INFA - Angkatan 2026",
  onOpenMobileNav
}: NavbarProps) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const titles: Record<NavTab, { title: string; subtitle: string }> = {
    overview: {
      title: "Ringkasan & Dashboard Kelas",
      subtitle: `Pusat informasi dan aktivitas kelas: ${groupName}`
    },
    bulletin: {
      title: "Papan Informasi & Kas Kelas",
      subtitle: "Pengingat uang kas, baju PDH, buku kuliah, dan info umum 1INFA"
    },
    deadlines: {
      title: "Reminder & Deadline Tugas",
      subtitle: "Tugas, kuis, dan laporan yang terdeteksi dari chat WhatsApp"
    },
    schedule: {
      title: "Jadwal Perkuliahan",
      subtitle: "Agenda mata kuliah mingguan, ruangan & tautan daring"
    },
    summary: {
      title: "Rangkuman Materi AI",
      subtitle: "Catatan penting dan intisari kuliah yang diekstrak dari obrolan"
    },
    quiz: {
      title: "Quiz & Latihan Soal",
      subtitle: "Uji pemahaman materi dengan kuis interaktif bertenaga AI"
    },
    chatai: {
      title: "Tanya AI Asisten Kelas",
      subtitle: "Asisten cerdas yang membaca dan memahami isi grup WhatsApp"
    }
  };

  const { title, subtitle } = titles[activeTab] || titles.overview;

  return (
    <header className="kl-header">
      {/* ─── DESKTOP HEADER VIEW ─── */}
      <div className="kl-header-desktop">
        {/* Page Title */}
        <div>
          <h1 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)", letterSpacing: "-0.3px" }}>
            {title}
          </h1>
          <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
            {subtitle}
          </p>
        </div>

        {/* Right Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Search Input */}
          <div style={{ position: "relative", width: "220px" }}>
            <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari materi, tugas..."
              className="kl-input"
              style={{ width: "100%", paddingLeft: "36px", height: "38px" }}
            />
          </div>

          {/* Sync Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Refresh Data Firestore"
              className="kl-btn kl-btn-secondary"
              style={{ padding: "8px 12px", height: "38px" }}
            >
              <RefreshCw size={15} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
            </button>
          )}

          {/* Trigger AI Extraction Button */}
          {onAnalyzeAI && (
            <button
              onClick={onAnalyzeAI}
              disabled={isAnalyzingAI}
              title="Analisis obrolan WhatsApp dengan Gemini AI untuk mengekstrak tugas, jadwal, dan rangkuman"
              className="kl-btn kl-btn-secondary"
              style={{ height: "38px", padding: "0 14px", borderColor: "#a7f3d0", color: "#047857", backgroundColor: "#f0fdf4" }}
            >
              <BrainCircuit size={15} style={{ animation: isAnalyzingAI ? "spin 1.5s linear infinite" : "none" }} />
              <span>{isAnalyzingAI ? "Menganalisis..." : "Analisis AI"}</span>
            </button>
          )}

          {/* Quick Ask AI CTA Button */}
          <button
            onClick={() => setActiveTab("chatai")}
            className="kl-btn kl-btn-primary"
            style={{ height: "38px", padding: "0 16px" }}
          >
            <Sparkles size={15} />
            <span>Tanya AI</span>
          </button>
        </div>
      </div>

      {/* ─── MOBILE HEADER VIEW ─── */}
      <div className="kl-header-mobile">
        <div className="kl-header-mobile-top">
          {/* Left: Hamburger & Brand Badge */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {onOpenMobileNav && (
              <button
                type="button"
                onClick={onOpenMobileNav}
                className="kl-mobile-icon-btn"
                title="Buka Menu Navigasi"
              >
                <Menu size={20} />
              </button>
            )}
            <div className="kl-mobile-brand-pill">
              <span className="kl-mobile-status-dot" />
              <span style={{ fontWeight: "800", fontSize: "14px", color: "var(--text-main)" }}>1INFA</span>
            </div>
          </div>

          {/* Right: Search Toggle & Analisis AI Compact Button */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className={`kl-mobile-icon-btn ${isMobileSearchOpen ? "active" : ""}`}
              title="Cari"
            >
              <Search size={18} />
            </button>

            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="kl-mobile-icon-btn"
                title="Segarkan Data"
              >
                <RefreshCw size={17} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none" }} />
              </button>
            )}

            {onAnalyzeAI && (
              <button
                type="button"
                onClick={onAnalyzeAI}
                disabled={isAnalyzingAI}
                className="kl-mobile-ai-btn"
                title="Analisis AI"
              >
                <BrainCircuit size={15} style={{ animation: isAnalyzingAI ? "spin 1.5s linear infinite" : "none" }} />
                <span>{isAnalyzingAI ? "Proses..." : "Analisis"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Mobile Search Bar */}
        {isMobileSearchOpen && (
          <div className="kl-mobile-search-bar">
            <Search size={15} style={{ color: "#94a3b8", flexShrink: 0 }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari tugas, materi, jadwal..."
              className="kl-mobile-search-input"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", display: "flex" }}
              >
                <X size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
