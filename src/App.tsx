import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, Timestamp, addDoc, serverTimestamp, deleteDoc, updateDoc, doc as fsDoc } from "firebase/firestore";
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

  // State data bersama yang disinkronkan secara real-time via Firestore
  const [deadlines, setDeadlines] = useState<TaskDeadline[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [summaries, setSummaries] = useState<CourseSummary[]>([]);
  const [quizzes, setQuizzes] = useState<QuizSet[]>([]);
  const [bulletins, setBulletins] = useState<BulletinItem[]>([]);



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

  // ─── Real-time Firestore Listener untuk Deadlines (Tugas) ───────────────────
  useEffect(() => {
    let unsubDeadlines = () => {};
    try {
      const q = query(collection(db, "deadlines"), orderBy("dueDate", "asc"));
      unsubDeadlines = onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
          const defaultDeadlines = [
            {
              title: "Tugas Praktikum: Struktur Kontrol & Array",
              course: "Algoritma & Struktur Data",
              dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
              dueTime: "23:59",
              priority: "high",
              status: "pending",
              sourceMessage: "Kumpulkan modul dan source code di portal akademik",
              lecturer: "Dr. Budi Santoso, M.Kom",
              type: "tugas_individu",
              createdAt: serverTimestamp(),
            },
            {
              title: "Perancangan Skema Database PostgreSQL",
              course: "Sistem Basis Data",
              dueDate: new Date(Date.now() + 6 * 86400000).toISOString().split("T")[0],
              dueTime: "23:59",
              priority: "medium",
              status: "pending",
              sourceMessage: "Tugas kelompok 2-3 orang format PDF laporan perancangan ERD",
              lecturer: "Siti Rahma, S.T., M.T.",
              type: "tugas_kelompok",
              createdAt: serverTimestamp(),
            },
          ];
          for (const item of defaultDeadlines) {
            await addDoc(collection(db, "deadlines"), item);
          }
          return;
        }

        const items: TaskDeadline[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || "",
            course: data.course || "Informatika",
            dueDate: data.dueDate || "",
            dueTime: data.dueTime || "23:59",
            priority: data.priority || "medium",
            status: data.status || "pending",
            sourceMessage: data.sourceMessage,
            lecturer: data.lecturer,
            type: data.type || "tugas_individu",
          };
        });
        setDeadlines(items);
      }, (err) => {
        console.error("Deadlines listener error:", err);
      });
    } catch (err) {
      console.error("Deadlines Firestore error:", err);
    }
    return () => unsubDeadlines();
  }, []);

  // ─── Real-time Firestore Listener untuk Jadwal Perkuliahan ──────────────────
  useEffect(() => {
    let unsubSchedules = () => {};
    try {
      const q = query(collection(db, "schedules"));
      unsubSchedules = onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
          const defaultSchedules = [
            {
              day: "Senin",
              course: "Algoritma & Struktur Data",
              code: "IF2101",
              lecturer: "Dr. Budi Santoso, M.Kom",
              startTime: "08:00",
              endTime: "10:30",
              room: "Lab Komputer 2",
              sks: 3,
              status: "normal",
              notes: "Membawa modul praktikum Bab 1-3",
              createdAt: serverTimestamp(),
            },
            {
              day: "Selasa",
              course: "Sistem Basis Data",
              code: "IF2102",
              lecturer: "Siti Rahma, S.T., M.T.",
              startTime: "10:00",
              endTime: "12:30",
              room: "Ruang Teori 304",
              sks: 3,
              status: "normal",
              notes: "Instalasi PostgreSQL di laptop masing-masing",
              createdAt: serverTimestamp(),
            },
            {
              day: "Rabu",
              course: "Pemrograman Web Lanjut",
              code: "IF2103",
              lecturer: "Ahmad Fauzi, M.Cs",
              startTime: "13:00",
              endTime: "15:30",
              room: "Lab Rekayasa Perangkat Lunak",
              sks: 3,
              status: "online",
              notes: "Kuliah daring via Zoom Meeting",
              meetLink: "https://zoom.us/j/1234567890",
              createdAt: serverTimestamp(),
            },
            {
              day: "Kamis",
              course: "Sistem Operasi",
              code: "IF2104",
              lecturer: "Prof. Hendra Wijaya",
              startTime: "08:00",
              endTime: "10:30",
              room: "Ruang 201",
              sks: 3,
              status: "normal",
              notes: "Pengenalan Linux Kernel dan Shell Scripting",
              createdAt: serverTimestamp(),
            },
            {
              day: "Jumat",
              course: "Matematika Diskrit",
              code: "IF2105",
              lecturer: "Dra. Nurul Hidayah, M.Si",
              startTime: "08:30",
              endTime: "11:00",
              room: "Ruang Teori 102",
              sks: 2,
              status: "normal",
              notes: "Materi Teori Graf & Relasi Logika",
              createdAt: serverTimestamp(),
            },
          ];
          for (const item of defaultSchedules) {
            await addDoc(collection(db, "schedules"), item);
          }
          return;
        }

        const items: ScheduleItem[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            day: data.day || "Senin",
            course: data.course || "",
            code: data.code || "",
            lecturer: data.lecturer || "",
            startTime: data.startTime || "",
            endTime: data.endTime || "",
            room: data.room || "",
            sks: data.sks || 3,
            status: data.status || "normal",
            notes: data.notes,
            meetLink: data.meetLink,
          };
        });
        setSchedules(items);
      }, (err) => {
        console.error("Schedules listener error:", err);
      });
    } catch (err) {
      console.error("Schedules Firestore error:", err);
    }
    return () => unsubSchedules();
  }, []);

  // ─── Real-time Firestore Listener untuk Rangkuman Materi AI ─────────────────
  useEffect(() => {
    let unsubSummaries = () => {};
    try {
      const q = query(collection(db, "summaries"), orderBy("date", "desc"));
      unsubSummaries = onSnapshot(q, (snapshot) => {
        const items: CourseSummary[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            course: data.course || "",
            date: data.date || "",
            topic: data.topic || "",
            keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
            actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
            materials: Array.isArray(data.materials) ? data.materials : [],
            aiConfidence: data.aiConfidence || 90,
            extractedFromCount: data.extractedFromCount || 1,
          };
        });
        setSummaries(items);
      }, (err) => {
        console.error("Summaries listener error:", err);
      });
    } catch (err) {
      console.error("Summaries Firestore error:", err);
    }
    return () => unsubSummaries();
  }, []);

  // ─── Real-time Firestore Listener untuk Latihan Kuis AI ─────────────────────
  useEffect(() => {
    let unsubQuizzes = () => {};
    try {
      const q = query(collection(db, "quizzes"));
      unsubQuizzes = onSnapshot(q, (snapshot) => {
        const items: QuizSet[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || "",
            course: data.course || "",
            description: data.description || "",
            durationMinutes: data.durationMinutes || 10,
            questions: Array.isArray(data.questions) ? data.questions : [],
            generatedFrom: data.generatedFrom || "AI",
            difficulty: data.difficulty || "Sedang",
          };
        });
        setQuizzes(items);
      }, (err) => {
        console.error("Quizzes listener error:", err);
      });
    } catch (err) {
      console.error("Quizzes Firestore error:", err);
    }
    return () => unsubQuizzes();
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

      // Simpan Deadlines ke Firestore agar semua orang langsung melihat
      if (Array.isArray(result.deadlines) && result.deadlines.length > 0) {
        for (const dl of result.deadlines) {
          const { id, ...dlData } = dl;
          await addDoc(collection(db, "deadlines"), {
            ...dlData,
            createdAt: serverTimestamp(),
          });
        }
      }

      // Simpan Jadwal ke Firestore
      if (Array.isArray(result.schedules) && result.schedules.length > 0) {
        for (const sch of result.schedules) {
          const { id, ...schData } = sch;
          await addDoc(collection(db, "schedules"), {
            ...schData,
            createdAt: serverTimestamp(),
          });
        }
      }

      // Simpan Rangkuman ke Firestore
      if (Array.isArray(result.summaries) && result.summaries.length > 0) {
        for (const sm of result.summaries) {
          const { id, ...smData } = sm;
          await addDoc(collection(db, "summaries"), {
            ...smData,
            createdAt: serverTimestamp(),
          });
        }
      }

      // Simpan Kuis ke Firestore
      if (Array.isArray(result.quizzes) && result.quizzes.length > 0) {
        for (const qz of result.quizzes) {
          const { id, ...qzData } = qz;
          await addDoc(collection(db, "quizzes"), {
            ...qzData,
            createdAt: serverTimestamp(),
          });
        }
      }

      // Simpan Catatan Bulletin ke Firestore
      if (Array.isArray(result.bulletins) && result.bulletins.length > 0) {
        for (const bl of result.bulletins) {
          const { id, ...blData } = bl;
          await addDoc(collection(db, "bulletins"), {
            ...blData,
            createdAt: serverTimestamp(),
          });
        }
      }

      setAiStatusMessage("Analisis selesai! Data tugas, jadwal, rangkuman, kuis, dan bulletin telah tersimpan di database dan otomatis tersinkronisasi ke seluruh mahasiswa.");
      setTimeout(() => setAiStatusMessage(null), 5000);
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

  // ─── Fungsi Deadlines (Firestore) ───────────────────────────────────────────
  const handleAddDeadline = async (task: Omit<TaskDeadline, "id">) => {
    try {
      await addDoc(collection(db, "deadlines"), {
        ...task,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error menambah deadline:", err);
      throw err;
    }
  };

  const handleToggleDeadline = async (id: string, currentStatus: "pending" | "in_progress" | "completed") => {
    try {
      const nextStatus = currentStatus === "completed" ? "pending" : "completed";
      await updateDoc(fsDoc(db, "deadlines", id), {
        status: nextStatus,
      });
    } catch (err) {
      console.error("Error update status deadline:", err);
      throw err;
    }
  };

  const handleDeleteDeadline = async (id: string) => {
    try {
      await deleteDoc(fsDoc(db, "deadlines", id));
    } catch (err) {
      console.error("Error menghapus deadline:", err);
      throw err;
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
                  onAddTask={handleAddDeadline}
                  onToggleComplete={handleToggleDeadline}
                  onDeleteTask={handleDeleteDeadline}
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
