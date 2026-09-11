import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { Message, TaskDeadline, ScheduleItem, CourseSummary, QuizSet, BulletinItem } from "@/types";

// Ambil API Key dari environment Vite
const getApiKey = (): string =>
  (import.meta.env.VITE_GEMINI_API_KEY || "").trim();

const getGroqKey = (): string =>
  (import.meta.env.VITE_GROQ_API_KEY || "").trim();

export interface AIProcessResult {
  deadlines: TaskDeadline[];
  schedules: ScheduleItem[];
  summaries: CourseSummary[];
  quizzes: QuizSet[];
  bulletins: BulletinItem[];
  message?: string;
}

/**
 * Analisis riwayat chat WhatsApp menggunakan model Gemini 3.6 Flash
 * untuk mengekstrak tugas, jadwal, rangkuman, dan kuis secara otomatis.
 */
export async function processChatWithAI(messages: Message[]): Promise<AIProcessResult> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("VITE_GEMINI_API_KEY belum dikonfigurasi di file web/.env.");
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      deadlines: [],
      schedules: [],
      summaries: [],
      quizzes: [],
      bulletins: [],
      message: "Belum ada pesan untuk dianalisis.",
    };
  }

  // Format transkrip pesan WhatsApp (ambil hingga 80 pesan terbaru)
  const chatTranscript = messages
    .slice(0, 80)
    .map((m) => {
      const sender = m.sender_name || "Anonim";
      const time = m.timestamp ? new Date(m.timestamp).toLocaleString("id-ID") : "";
      const group = m.group_name ? `[${m.group_name}] ` : "";
      const content = m.content || (m.media_type ? `[File/Media: ${m.media_type}]` : "");
      return `[${time}] ${group}${sender}: ${content}`;
    })
    .join("\n");

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const prompt = `Anda adalah sistem kecerdasan akademik untuk kelas "1INFA - Informatika A Angkatan 2026".
Analisis transkrip percakapan WhatsApp (dari satu atau beberapa grup sumber informasi seperti rombel, angkatan, dll) berikut ini dan ekstrak informasi akademik ke dalam format JSON yang valid.

Transkrip Obrolan WhatsApp:
---
${chatTranscript}
---

Instruksi Ekstraksi:
1. "deadlines": Cari tugas, kuis, proyek, PR, atau laporan yang diberikan dosen/komti yang memiliki batas waktu pengumpulan.
2. "schedules": Cari perubahan jadwal, info kelas online via Zoom/GMeet, perpindahan ruang, atau kelas pengganti.
3. "summaries": Rangkum topik materi perkuliahan penting yang dibahas atau dijelaskan oleh dosen/teman kelas.
4. "quizzes": Buat kuis latihan pilihan ganda (3-5 soal) berdasarkan materi/kisi-kisi yang dibahas di obrolan.

5. "bulletins": Cari informasi pengingat kelas non-tugas seperti uang kas (standar kelas 1INFA: Rp 5.000/minggu atau Rp 20.000/bulan), pembuatan seragam/baju PDH Informatika A (standar: sekitar Rp 135.000), pembelian buku/modul, informasi lomba/webinar, barang hilang/ketinggalan, ajakan kumpul, atau info santai/random lainnya di grup.

Keluarkan format JSON PERSIS seperti skema berikut:
{
  "deadlines": [
    {
      "id": "dl-1",
      "title": "Nama tugas",
      "course": "Mata kuliah",
      "dueDate": "YYYY-MM-DD",
      "dueTime": "HH:MM",
      "priority": "high" | "medium" | "low",
      "status": "pending",
      "lecturer": "Nama dosen (jika ada)",
      "sourceMessage": "Kutipan pesan asli dari chat",
      "type": "tugas_individu" | "tugas_kelompok" | "kuis" | "laporan"
    }
  ],
  "schedules": [
    {
      "id": "sch-1",
      "day": "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat",
      "course": "Nama mata kuliah",
      "code": "Kode MK",
      "lecturer": "Nama dosen",
      "startTime": "HH:MM",
      "endTime": "HH:MM",
      "room": "Ruangan atau Zoom",
      "sks": 2,
      "status": "normal" | "rescheduled" | "online",
      "meetLink": "URL Zoom/GMeet jika ada",
      "notes": "Catatan khusus dari chat"
    }
  ],
  "summaries": [
    {
      "id": "sum-1",
      "course": "Mata kuliah",
      "topic": "Judul materi/bab",
      "date": "Tanggal bahasan",
      "lecturer": "Nama dosen",
      "keyPoints": ["Poin penting 1", "Poin penting 2", "Poin penting 3"],
      "actionItems": ["Tugas/aksi yang perlu dilakukan mahasiswa"]
    }
  ],
  "quizzes": [
    {
      "id": "qz-1",
      "course": "Mata kuliah",
      "topic": "Topik kuis",
      "questions": [
        {
          "question": "Pertanyaan latihan",
          "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
          "correctAnswer": 0,
          "explanation": "Penjelasan mengapa jawaban tersebut benar"
        }
      ]
    }
  ],
  "bulletins": [
    {
      "id": "b-1",
      "title": "Judul Pengingat atau Info",
      "category": "kas" | "pdh" | "buku" | "pengumuman" | "random",
      "content": "Rincian isi informasi pengingat yang jelas dan ringkas",
      "tag": "Pengingat Kas" | "Baju PDH" | "Buku Kuliah" | "Pengumuman" | "Info Santai",
      "highlight": "Highlight nominal atau catatan singkat jika ada (contoh: 'Rp 5.000 / minggu', 'Rp 135.000', 'Penting')",
      "sourceMessage": "Kutipan chat jika ada"
    }
  ]
}`;

  try {
    const response = await model.generateContent(prompt);
    const text = response.response.text();
    const parsed: AIProcessResult = JSON.parse(text);

    // Preset bawaan kelas 1INFA
    const defaultBulletins: BulletinItem[] = [
      {
        id: "b-kas-default",
        title: "Uang Kas Kelas 1INFA",
        category: "kas",
        content: "Iuran kas kelas 1INFA dikumpulkan rutin untuk keperluan fotokopi modul, perlengkapan kelas, dan kegiatan bersama.",
        tag: "Pengingat Kas",
        highlight: "Rp 5.000/mgg atau Rp 20.000/bln",
      },
      {
        id: "b-pdh-default",
        title: "Baju PDH Informatika A",
        category: "pdh",
        content: "Pembuatan seragam Pakaian Dinas Harian (PDH) resmi angkatan Informatika A.",
        tag: "Info Baju PDH",
        highlight: "Sekitar Rp 135.000",
      },
      {
        id: "b-buku-default",
        title: "Buku & Modul Kuliah",
        category: "buku",
        content: "Pembelian buku dan modul praktikum diatur langsung sesuai instruksi dosen tiap mata kuliah.",
        tag: "Buku Kuliah",
        highlight: "Sesuai Arahan Dosen",
      },
    ];

    let finalBulletins = Array.isArray(parsed.bulletins) ? [...parsed.bulletins] : [];
    if (!finalBulletins.some(b => b.category === "kas")) {
      finalBulletins.unshift(defaultBulletins[0]);
    }
    if (!finalBulletins.some(b => b.category === "pdh")) {
      finalBulletins.splice(1, 0, defaultBulletins[1]);
    }
    if (!finalBulletins.some(b => b.category === "buku")) {
      finalBulletins.push(defaultBulletins[2]);
    }

    return {
      deadlines: Array.isArray(parsed.deadlines) ? parsed.deadlines : [],
      schedules: Array.isArray(parsed.schedules) ? parsed.schedules : [],
      summaries: Array.isArray(parsed.summaries) ? parsed.summaries : [],
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
      bulletins: finalBulletins,
    };
  } catch (error: any) {
    console.error("Gemini AI Process Error:", error);
    throw new Error(error.message || "Gagal memproses analisis dengan Gemini 3.6 Flash.");
  }
}

/**
 * Tanya Jawab AI dengan Asisten Kelas 1INFA (Streaming)
 * Prioritas: Groq (gratis & cepat) → fallback ke Gemini 3.6 Flash
 */
export async function askClassAI(
  question: string,
  messages: Message[],
  onChunk: (chunk: string) => void
): Promise<string> {
  const groqKey = getGroqKey();
  const geminiKey = getApiKey();

  if (!groqKey && !geminiKey) {
    throw new Error("Tidak ada API key yang dikonfigurasi. Isi VITE_GROQ_API_KEY atau VITE_GEMINI_API_KEY di file .env.local");
  }

  // Siapkan konteks chat
  let contextText = "Belum ada riwayat pesan obrolan kelas yang tercatat.";
  if (Array.isArray(messages) && messages.length > 0) {
    const todayStr = new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    contextText = messages
      .filter((m) => m.content && m.content.trim().length > 0)
      .slice(0, 30)  // 30 pesan terbaru (urutan: terbaru → terlama)
      .map((m) => {
        const sender = m.sender_name || "Anonim";
        const content = (m.content || "").slice(0, 300);
        // Timestamp ringkas: "hari ini 14:30" atau "10 Sep 09:00"
        const ts = m.timestamp ? new Date(m.timestamp) : null;
        const timeStr = ts
          ? ts.toLocaleDateString("id-ID", { day: "numeric", month: "short" }) === todayStr
            ? `hari ini ${ts.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
            : `${ts.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} ${ts.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
          : "";
        const groupStr = m.group_name ? `[${m.group_name}] ` : "";
        return `[${timeStr}] ${groupStr}${sender}: ${content}`;
      })
      .join("\n");
  }

  const systemPrompt = `Anda adalah Asisten AI Cerdas untuk kelas "1INFA - Informatika A Angkatan 2026".
Tugas Anda adalah menjawab pertanyaan mahasiswa secara ramah, ringkas, jelas, dan akurat berdasarkan riwayat pesan WhatsApp di bawah yang dapat berasal dari beberapa grup informasi (rombel, angkatan, himpunan, dll).

Pedoman:
1. Jika ada informasi mengenai tugas, deadline, kuis, jadwal kuliah, atau pengumuman di riwayat obrolan, utamakan info tersebut dan sebutkan nama grup asalnya jika relevan.
2. Gunakan format markdown rapi (bullet points, bold) agar mudah dibaca mahasiswa.
3. Jika informasi yang ditanyakan belum pernah dibahas di riwayat pesan grup, sampaikan dengan sopan.
4. Jangan berasumsi atau membuat informasi tugas/jadwal palsu di luar data yang ada.
5. Jawab secara singkat dan padat.`;

  const userPrompt = `Konteks Riwayat Obrolan WhatsApp Kelas 1INFA:
---
${contextText}
---

Pertanyaan Mahasiswa:
"${question}"`;

  // ── GROQ (Primary — Gratis & Sangat Cepat) ──────────────────────────────────
  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey, dangerouslyAllowBrowser: true });
      const stream = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",  // Model gratis, sangat capable
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt }
        ],
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      });

      let fullText = "";
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || "";
        fullText += delta;
        onChunk(fullText);
      }
      return fullText.trim() || "Tidak ada respon dari AI.";
    } catch (groqError: any) {
      console.warn("Groq error, mencoba fallback ke Gemini:", groqError.message);
      // Lanjut ke fallback Gemini di bawah
    }
  }

  // ── GEMINI 3.6 Flash (Fallback) ─────────────────────────────────────────────
  if (!geminiKey) {
    throw new Error("Groq gagal dan tidak ada VITE_GEMINI_API_KEY sebagai fallback.");
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: systemPrompt,
    });
    const streamResult = await model.generateContentStream(userPrompt);
    let fullText = "";
    for await (const chunk of streamResult.stream) {
      fullText += chunk.text();
      onChunk(fullText);
    }
    return fullText.trim() || "Tidak ada respon dari AI.";
  } catch (error: any) {
    console.error("Gemini fallback error:", error);
    throw new Error(error.message || "Gagal berkomunikasi dengan AI.");
  }
}
