import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, Timestamp, addDoc, serverTimestamp, deleteDoc, doc as fsDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Message, NavTab, TaskDeadline, ScheduleItem, CourseSummary, QuizSet, BulletinItem, AIChatMessage } from "@/types";
import { processChatWithAI } from "@/services/aiService";

import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";

import OverviewView from "@/components/views/OverviewView";
import BulletinView from "@/components/views/BulletinView";
import DeadlineView from "@/components/views/DeadlineView";
import ScheduleView from "@/components/views/ScheduleView";
import SummaryView from "@/components/views/SummaryView";
import QuizView from "@/components/views/QuizView";
import ChatAiView from "@/components/views/ChatAiView";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data asli dari Firestore
  const [messages, setMessages] = useState<Message[]>([]);

  // State hasil analisis dengan LocalStorage Persistence (agar tidak hilang saat refresh)
  const [deadlines, setDeadlines] = useState<TaskDeadline[]>(() => {
    try {
      const saved = localStorage.getItem("1infa_deadlines");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => {
    try {
      const saved = localStorage.getItem("1infa_schedules");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [summaries, setSummaries] = useState<CourseSummary[]>(() => {
    try {
      const saved = localStorage.getItem("1infa_summaries");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quizzes, setQuizzes] = useState<QuizSet[]>(() => {
    try {
      const saved = localStorage.getItem("1infa_quizzes");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bulletins, setBulletins] = useState<BulletinItem[]>([]);

  // Simpan ke LocalStorage jika state berubah
  useEffect(() => {
    localStorage.setItem("1infa_deadlines", JSON.stringify(deadlines));
  }, [deadlines]);

  useEffect(() => {
    localStorage.setItem("1infa_schedules", JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem("1infa_summaries", JSON.stringify(summaries));
  }, [summaries]);

  useEffect(() => {
    localStorage.setItem("1infa_quizzes", JSON.stringify(quizzes));
  }, [quizzes]);



  // Chat History AI - persisted across tab switches
  const [chatHistory, setChatHistory] = useState<AIChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("1infa_chat_history");
      return saved ? JSON.parse(saved) : [{
        id: "ai-welcome",
        sender: "ai" as const,
        text: "Halo! Saya Asisten AI 1INFA bertenaga Google Gemini. Saya membaca dan memahami percakapan di grup WhatsApp kelas 1INFA. Tanyakan apa saja mengenai tugas, deadline, jadwal kuliah, atau materi dosen!",
        timestamp: "Baru saja",
      }];
    } catch {
      return [{
        id: "ai-welcome",
        sender: "ai" as const,
        text: "Halo! Saya Asisten AI 1INFA bertenaga Google Gemini. Tanyakan apa saja mengenai tugas, deadline, atau jadwal kuliah!",
        timestamp: "Baru saja",
      }];
    }
  });

  useEffect(() => {
    // Simpan maks 50 pesan terakhir supaya tidak membebani localStorage
    const toSave = chatHistory.slice(-50);
    localStorage.setItem("1infa_chat_history", JSON.stringify(toSave));
  }, [chatHistory]);

  // ─── Real-time Firestore Listener untuk Bulletin Board ────────────────────
  useEffect(() => {
    const defaultBulletins = [
      {
        title: "Uang Kas Kelas 1INFA",
        category: "kas",
        content: "Iuran kas kelas 1INFA dikumpulkan rutin untuk keperluan fotokopi modul, perlengkapan kelas, dan kegiatan bersama.",
        tag: "Pengingat Kas",
        highlight: "Rp 5.000/mgg atau Rp 20.000/bln",
        createdAt: Timestamp.fromDate(new Date("2020-01-03")),
      },
      {
        title: "Baju PDH Informatika A",
        category: "pdh",
        content: "Pembuatan seragam Pakaian Dinas Harian (PDH) resmi angkatan Informatika A. Estimasi biaya sekitar Rp 135.000.",
        tag: "Info Baju PDH",
        highlight: "Sekitar Rp 135.000",
        createdAt: Timestamp.fromDate(new Date("2020-01-02")),
      },
      {
        title: "Buku & Modul Kuliah",
        category: "buku",
        content: "Pembelian buku dan modul praktikum diatur langsung sesuai instruksi dosen tiap mata kuliah.",
        tag: "Buku Kuliah",
        highlight: "Sesuai Arahan Dosen",
        createdAt: Timestamp.fromDate(new Date("2020-01-01")),
      },
    ];

    let unsubBulletins = () => {};
    try {
      const bq = query(collection(db, "bulletins"), orderBy("createdAt", "desc"));
      unsubBulletins = onSnapshot(bq, async (snapshot) => {
        if (snapshot.empty) {
          for (const item of defaultBulletins) {
            await addDoc(collection(db, "bulletins"), item);
          }
          return;
        }
        const items: BulletinItem[] = snapshot.docs.map((d) => ({
          id: d.id,
          title: d.data().title || "",
          category: d.data().category || "random",
          content: d.data().content || "",
          tag: d.data().tag,
          highlight: d.data().highlight,
          sourceMessage: d.data().sourceMessage,
          date: d.data().date,
        }));
        setBulletins(items);
      }, (err) => {
        console.error("Bulletins listener error:", err);
      });
    } catch (err) {
      console.error("Bulletins Firestore error:", err);
    }
    return () => unsubBulletins();
  }, []);

  // ─── Real-time Firestore Listener untuk Pesan WhatsApp ─────────────────────

  useEffect(() => {
    let unsubscribe = () => {};

    try {
      const q = query(
        collection(db, "messages"),
        orderBy("timestamp", "desc"),
        limit(150)
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const firestoreMsgs: Message[] = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                sender_name: data.sender_name || "Anonim",
                sender_number: data.sender_number || "",
                group_name: data.group_name || "1INFA - Angkatan 2026",
                group_id: data.group_id || "",
                content: data.content ?? null,
                media_url: data.media_url ?? null,
                media_type: data.media_type || "text",
                category: data.category || "umum",
                timestamp:
                  data.timestamp instanceof Timestamp
                    ? data.timestamp.toDate()
                    : new Date(data.timestamp || Date.now()),
                created_at:
                  data.created_at instanceof Timestamp
                    ? data.created_at.toDate()
                    : new Date(),
              };
            })
            .filter((m) => m.group_name !== "Chat Pribadi");

          setMessages(firestoreMsgs);
          setLoading(false);
        },
        (error) => {
          console.error("Firestore listener error:", error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Firebase connection error:", err);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // ─── Fungsi Analisis Gemini 3.6 Flash Langsung di Frontend ─────────────────
  const handleAnalyzeWithAI = async () => {
    if (messages.length === 0) {
      setAiStatusMessage("Belum ada pesan WhatsApp dari grup untuk dianalisis.");
      setTimeout(() => setAiStatusMessage(null), 3000);
      return;
    }

    setIsAnalyzingAI(true);
    setAiStatusMessage("Sedang menganalisis riwayat obrolan dengan Gemini 3.6 Flash...");

    try {
      const result = await processChatWithAI(messages);

      if (Array.isArray(result.deadlines) && result.deadlines.length > 0) {
        setDeadlines(result.deadlines);
      }
      if (Array.isArray(result.schedules) && result.schedules.length > 0) {
        setSchedules(result.schedules);
      }
      if (Array.isArray(result.summaries) && result.summaries.length > 0) {
        setSummaries(result.summaries);
      }
      if (Array.isArray(result.quizzes) && result.quizzes.length > 0) {
        setQuizzes(result.quizzes);
      }
      if (Array.isArray(result.bulletins) && result.bulletins.length > 0) {
        setBulletins(result.bulletins);
      }

      setAiStatusMessage("Analisis selesai! Data tugas, jadwal, rangkuman, kuis, dan pengumuman kas/PDH telah diperbarui.");
      setTimeout(() => setAiStatusMessage(null), 4000);
    } catch (err: any) {
      console.error("AI Analysis error:", err);
      setAiStatusMessage(`Gagal: ${err.message}`);
      setTimeout(() => setAiStatusMessage(null), 6000);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  // ─── Fungsi Bulletin Board (Firestore) ──────────────────────────────────────
  const handleAddBulletin = async (item: Omit<BulletinItem, "id">) => {
    try {
      await addDoc(collection(db, "bulletins"), {
        ...item,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error menambah catatan:", err);
    }
  };

  const handleDeleteBulletin = async (id: string) => {
    try {
      await deleteDoc(fsDoc(db, "bulletins", id));
    } catch (err) {
      console.error("Error menghapus catatan:", err);
    }
  };

  const uniqueGroupNames = Array.from(
    new Set(messages.map((m) => m.group_name).filter(Boolean))
  );
  const groupName =
    uniqueGroupNames.length === 1
      ? uniqueGroupNames[0]
      : uniqueGroupNames.length > 1
      ? `${uniqueGroupNames[0]} (+${uniqueGroupNames.length - 1} grup)`
      : "1INFA - Angkatan 2026";

  const pendingDeadlinesCount = deadlines.filter((d) => d.status !== "completed").length;

  return (
    <div className="kl-app-container">
      {/* Sidebar Navigation (Desktop Sticky / Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadDeadlinesCount={pendingDeadlinesCount}
        quizCount={quizzes.length}
        groupName={groupName}
        messageCount={messages.length}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="kl-main">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRefresh={handleManualRefresh}
          isRefreshing={isRefreshing}
          onAnalyzeAI={handleAnalyzeWithAI}
          isAnalyzingAI={isAnalyzingAI}
          groupName={groupName}
          onOpenMobileNav={() => setIsMobileMenuOpen(true)}
        />

        {/* Global Floating AI Status Banner */}
        {aiStatusMessage && (
          <div
            className="kl-ai-status-banner"
            style={{
              margin: "16px 32px 0 32px",
              padding: "12px 18px",
              borderRadius: "12px",
              backgroundColor: aiStatusMessage.startsWith("Gagal") ? "#fff1f2" : "#f0fdf4",
              border: `1px solid ${aiStatusMessage.startsWith("Gagal") ? "#fecdd3" : "#bbf7d0"}`,
              color: aiStatusMessage.startsWith("Gagal") ? "#e11d48" : "#15803d",
              fontSize: "13px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
              animation: "fadeIn 0.2s ease-in-out",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>{aiStatusMessage.startsWith("Gagal") ? "!" : "✓"}</span>
              <span>{aiStatusMessage}</span>
            </div>
            <button
              onClick={() => setAiStatusMessage(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontWeight: "bold" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* View Content Switcher */}
        <main className="kl-content">
          {loading ? (
            <div style={{ padding: "60px 0", textAlign: "center" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  border: "3px solid #e2e8f0",
                  borderTopColor: "var(--primary)",
                  borderRadius: "50%",
                  margin: "0 auto 16px auto",
                  animation: "spin 1s linear infinite",
                }}
              />
              <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-main)" }}>
                Menghubungkan ke database 1INFA...
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "4px" }}>
                Memuat pesan WhatsApp kelas secara real-time
              </p>
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewView
                  messages={messages}
                  deadlines={deadlines}
                  schedules={schedules}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === "bulletin" && (
                <BulletinView
                  bulletins={bulletins}
                  onAddBulletin={handleAddBulletin}
                  onDeleteBulletin={handleDeleteBulletin}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === "deadlines" && (
                <DeadlineView
                  deadlines={deadlines}
                  setDeadlines={setDeadlines}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === "schedule" && (
                <ScheduleView
                  schedules={schedules}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === "summary" && (
                <SummaryView
                  summaries={summaries}
                  searchQuery={searchQuery}
                  messages={messages}
                />
              )}

              {activeTab === "quiz" && (
                <QuizView
                  quizzes={quizzes}
                  searchQuery={searchQuery}
                  messages={messages}
                />
              )}

              {activeTab === "chatai" && (
                <ChatAiView
                  messages={messages}
                  chatHistory={chatHistory}
                  setChatHistory={setChatHistory}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Fixed at bottom for <= 768px) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadDeadlinesCount={pendingDeadlinesCount}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
      />
    </div>
  );
}
