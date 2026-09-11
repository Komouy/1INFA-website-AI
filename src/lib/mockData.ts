// lib/mockData.ts - Initial data & samples parsed from WhatsApp Group class discussions

import { TaskDeadline, ScheduleItem, CourseSummary, QuizSet, Message } from "@/types";

export const SAMPLE_MESSAGES: Message[] = [
  {
    id: "msg-1",
    sender_name: "Pak Budi (Dosen Basis Data)",
    sender_number: "+6281234567890",
    group_name: "1INFA - TI Angkatan 24",
    content: "Selamat pagi rekan-rekan mahasiswa. Untuk pertemuan besok kita beralih via Zoom jam 08.00 WIB karena ada rapat fakultas. Link: https://zoom.us/j/992817263. Jangan lupa tugas normalisasi database ERD dikumpul paling lambat Jumat 23:59 WIB di Spada/Google Classroom.",
    media_type: "text",
    category: "tugas",
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 mins ago
    created_at: new Date(),
  },
  {
    id: "msg-2",
    sender_name: "Farhan (Komti Kelas)",
    sender_number: "+6285788990011",
    group_name: "1INFA - TI Angkatan 24",
    content: "PENGUMUMAN PENTING: Jadwal Pengganti Praktikum Pemrograman Web dimajukan ke hari Kamis jam 13:00 di Lab 304. Modul 4 sudah di-upload ke group, silakan dipelajari untuk pre-test.",
    media_type: "document",
    media_url: "Modul_4_React_NextJS_Tailwind.pdf",
    category: "pengumuman",
    timestamp: new Date(Date.now() - 1000 * 60 * 80),
    created_at: new Date(),
  },
  {
    id: "msg-3",
    sender_name: "Bu Ratna (Dosen Algoritma)",
    sender_number: "+6282199887766",
    group_name: "1INFA - TI Angkatan 24",
    content: "Materi Divide and Conquer & Dynamic Programming sudah saya rangkumkan. Kisi-kisi Quiz pekan depan: Merge Sort, Quick Sort, Knapsack Problem, dan Fibonacci DP.",
    media_type: "image",
    media_url: "kisi_kisi_quiz_algoritma.png",
    category: "materi",
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    created_at: new Date(),
  },
  {
    id: "msg-4",
    sender_name: "Ahmad Rizky",
    sender_number: "+6287711223344",
    group_name: "1INFA - TI Angkatan 24",
    content: "Teman-teman, untuk pembagian kelompok proyek Sistem Operasi maks 4 orang ya. Tolong list nama kelompok di spreadsheet sebelum besok sore.",
    media_type: "text",
    category: "diskusi",
    timestamp: new Date(Date.now() - 1000 * 60 * 320),
    created_at: new Date(),
  },
  {
    id: "msg-5",
    sender_name: "Siti Nurhaliza",
    sender_number: "+628991234567",
    group_name: "1INFA - TI Angkatan 24",
    content: "Izin bertanya Pak, untuk laporan mingguan Pemrograman Web apakah diketik atau tulis tangan diagram arsitekturnya?",
    media_type: "text",
    category: "diskusi",
    timestamp: new Date(Date.now() - 1000 * 60 * 500),
    created_at: new Date(),
  }
];

export const SAMPLE_DEADLINES: TaskDeadline[] = [
  {
    id: "task-1",
    title: "Tugas 3: Perancangan ERD & Normalisasi 3NF",
    course: "Sistem Basis Data",
    dueDate: "2026-09-12",
    dueTime: "23:59",
    priority: "high",
    status: "pending",
    lecturer: "Dr. Budi Santoso, M.Kom",
    sourceMessage: "WA Chat: '...tugas normalisasi database ERD dikumpul paling lambat Jumat 23:59 WIB...'",
    type: "tugas_individu",
  },
  {
    id: "task-2",
    title: "Laporan Praktikum Modul 4: React & API Integration",
    course: "Pemrograman Web Lanjut",
    dueDate: "2026-09-14",
    dueTime: "17:00",
    priority: "high",
    status: "in_progress",
    lecturer: "Ir. Hendra Wijaya, M.T",
    sourceMessage: "WA Chat: 'Modul 4 sudah di-upload ke group, silakan dipelajari untuk pre-test dan laporan...'",
    type: "laporan",
  },
  {
    id: "task-3",
    title: "Pembentukan Tim & Proposal Proyek Kernel",
    course: "Sistem Operasi",
    dueDate: "2026-09-15",
    dueTime: "15:00",
    priority: "medium",
    status: "pending",
    lecturer: "Prof. Irwan Setiawan",
    sourceMessage: "WA Chat: 'Tolong list nama kelompok di spreadsheet sebelum besok sore.'",
    type: "tugas_kelompok",
  },
  {
    id: "task-4",
    title: "Quiz 2: Dynamic Programming & Greedy Algorithm",
    course: "Algoritma & Struktur Data",
    dueDate: "2026-09-17",
    dueTime: "08:30",
    priority: "medium",
    status: "pending",
    lecturer: "Ratna Sari, M.Cs",
    sourceMessage: "WA Chat: 'Kisi-kisi Quiz pekan depan: Merge Sort, Quick Sort, Knapsack Problem...'",
    type: "kuis",
  },
  {
    id: "task-5",
    title: "Tugas Resume Paper IEEE: Machine Learning Basics",
    course: "Kecerdasan Buatan",
    dueDate: "2026-09-08",
    dueTime: "23:59",
    priority: "low",
    status: "completed",
    lecturer: "Dr. Agus Prasetyo",
    sourceMessage: "WA Chat Dosen AI pekan lalu",
    type: "tugas_individu",
  }
];

export const SAMPLE_SCHEDULE: ScheduleItem[] = [
  {
    id: "sch-1",
    day: "Senin",
    course: "Algoritma & Pemrograman Lanjut",
    code: "IF201",
    lecturer: "Ratna Sari, M.Cs",
    startTime: "08:00",
    endTime: "10:30",
    room: "Lab Komputer 302",
    sks: 3,
    status: "normal",
    notes: "Membawa laptop & install GCC compiler",
  },
  {
    id: "sch-2",
    day: "Senin",
    course: "Matematika Diskrit",
    code: "IF202",
    lecturer: "Drs. Joko Purwanto, M.Si",
    startTime: "13:00",
    endTime: "15:30",
    room: "Gedung B - Ruang 204",
    sks: 3,
    status: "normal",
  },
  {
    id: "sch-3",
    day: "Selasa",
    course: "Sistem Basis Data",
    code: "IF203",
    lecturer: "Dr. Budi Santoso, M.Kom",
    startTime: "08:00",
    endTime: "10:30",
    room: "Zoom Online (Deteksi WA)",
    sks: 3,
    status: "online",
    meetLink: "https://zoom.us/j/992817263",
    notes: "Dialihkan daring via Zoom karena rapat dosen fakultas",
  },
  {
    id: "sch-4",
    day: "Rabu",
    course: "Sistem Operasi",
    code: "IF204",
    lecturer: "Prof. Irwan Setiawan",
    startTime: "10:00",
    endTime: "12:30",
    room: "Gedung C - Ruang 101",
    sks: 3,
    status: "normal",
  },
  {
    id: "sch-5",
    day: "Kamis",
    course: "Praktikum Pemrograman Web",
    code: "IF205L",
    lecturer: "Ir. Hendra Wijaya, M.T",
    startTime: "13:00",
    endTime: "16:00",
    room: "Lab RPL - 304",
    sks: 2,
    status: "rescheduled",
    notes: "Jadwal dimajukan sesuai konfirmasi Komti di grup WA",
  },
  {
    id: "sch-6",
    day: "Jumat",
    course: "Etika Profesi & Komunikasi",
    code: "IF206",
    lecturer: "Dr. Maya Indah, S.Kom, M.M",
    startTime: "08:30",
    endTime: "10:30",
    room: "Auditorium Lantai 4",
    sks: 2,
    status: "normal",
  }
];

export const SAMPLE_SUMMARIES: CourseSummary[] = [
  {
    id: "sum-1",
    course: "Sistem Basis Data",
    date: "10 September 2026",
    topic: "Normalisasi 1NF, 2NF, 3NF & Boyce-Codd (BCNF)",
    keyPoints: [
      "1NF mengharuskan setiap atribut bernilai atomik (tidak ada multivalued attribute / array)",
      "2NF harus sudah 1NF dan tidak memiliki ketergantungan parsial (semua non-key dependent pada seluruh Primary Key)",
      "3NF menghilangkan transitive dependency (A -> B, B -> C maka A -> C harus dipecah ke tabel baru)",
      "Tugas implementasi dikumpul pekan ini di Spada dengan format SQL dump + diagram schema"
    ],
    actionItems: [
      "Kerjakan studi kasus rental mobil dengan 3NF",
      "Kumpulkan laporan PDF dan script DDL SQL paling lambat Jumat"
    ],
    materials: [
      { name: "Slide_Pertemuan_4_Normalisasi.pdf", type: "pdf" },
      { name: "Script_DDL_Sample_Schema.sql", type: "link" }
    ],
    aiConfidence: 98,
    extractedFromCount: 14
  },
  {
    id: "sum-2",
    course: "Algoritma & Struktur Data",
    date: "09 September 2026",
    topic: "Analisis Kompleksitas Big-O & Divide and Conquer",
    keyPoints: [
      "Divide: Membagi masalah menjadi sub-masalah independen yang lebih kecil",
      "Conquer: Menyelesaikan sub-masalah secara rekursif",
      "Combine: Menggabungkan solusi sub-masalah untuk solusi akhir",
      "Kompleksitas Merge Sort adalah O(n log n) di best, average, dan worst case"
    ],
    actionItems: [
      "Persiapkan Quiz 2 yang mencakup Merge Sort vs Quick Sort",
      "Latihan implementasi rekursif di C++/Java"
    ],
    materials: [
      { name: "Rangkuman_Divide_Conquer.pdf", type: "pdf" }
    ],
    aiConfidence: 95,
    extractedFromCount: 22
  },
  {
    id: "sum-3",
    course: "Pemrograman Web Lanjut",
    date: "08 September 2026",
    topic: "React Architecture, State Management, & Tailwind CSS",
    keyPoints: [
      "React menggunakan Virtual DOM untuk rendering super cepat dan reaktif",
      "Hooks utama: useState untuk reaktif variabel, useEffect untuk side-effects / fetch Firebase",
      "Komponen harus modular dan reusable dengan props type yang jelas",
      "Tailwind CSS v4 menyederhanakan konfigurasi langsung di globals.css"
    ],
    actionItems: [
      "Setup dashboard kelas Klasia menggunakan Next.js + Tailwind",
      "Integrasi Firestore real-time listener"
    ],
    materials: [
      { name: "Cheatsheet_React_Hooks.pdf", type: "pdf" },
      { name: "Modul_4_NextJS_Firebase.pdf", type: "pdf" }
    ],
    aiConfidence: 99,
    extractedFromCount: 31
  }
];

export const SAMPLE_QUIZZES: QuizSet[] = [
  {
    id: "quiz-1",
    title: "Quiz Latihan: Basis Data & Normalisasi",
    course: "Sistem Basis Data",
    description: "Soal latihan otomatis yang di-generate AI berdasarkan diskusi chat grup dan materi Pak Budi.",
    durationMinutes: 10,
    generatedFrom: "Diskusi WA 10 September 2026",
    difficulty: "Sedang",
    questions: [
      {
        id: "q1",
        question: "Kondisi di mana sebuah kolom non-primary key bergantung hanya pada sebagian dari Composite Primary Key disebut sebagai?",
        options: [
          "Transitive Dependency",
          "Partial Dependency",
          "Multivalued Dependency",
          "Functional Dependency Penuh"
        ],
        correctAnswer: 1,
        explanation: "Partial dependency (ketergantungan parsial) terjadi saat atribut non-kunci bergantung pada salah satu bagian dari composite key, melanggar syarat 2NF."
      },
      {
        id: "q2",
        question: "Syarat mutlak agar suatu tabel berada dalam bentuk Third Normal Form (3NF) adalah?",
        options: [
          "Harus sudah 2NF dan tidak memiliki transitive dependency",
          "Harus memiliki setidaknya 5 foreign key",
          "Tidak boleh memiliki atribut tipe data teks",
          "Harus sudah berbentuk BCNF terlebih dahulu"
        ],
        correctAnswer: 0,
        explanation: "3NF mengharuskan tabel sudah memenuhi 2NF dan setiap atribut non-prime tidak memiliki transitive dependency terhadap superkey."
      },
      {
        id: "q3",
        question: "Kapan batas akhir pengumpulan tugas ERD sesuai info di grup WhatsApp?",
        options: [
          "Rabu jam 12:00",
          "Kamis jam 17:00",
          "Jumat jam 23:59",
          "Minggu jam 23:59"
        ],
        correctAnswer: 2,
        explanation: "Sesuai pesan Pak Budi di grup: 'tugas normalisasi database ERD dikumpul paling lambat Jumat 23:59 WIB'."
      }
    ]
  },
  {
    id: "quiz-2",
    title: "Quick Review: Algoritma Divide & Conquer",
    course: "Algoritma & Struktur Data",
    description: "Persiapan menghadapi Quiz 2 pekan depan sesuai kisi-kisi Bu Ratna.",
    durationMinutes: 8,
    generatedFrom: "Kisi-kisi Bu Ratna di WA",
    difficulty: "Sulit",
    questions: [
      {
        id: "q2-1",
        question: "Berapa time complexity dari algoritma Merge Sort pada skenario Worst-Case?",
        options: [
          "O(n)",
          "O(n log n)",
          "O(n^2)",
          "O(log n)"
        ],
        correctAnswer: 1,
        explanation: "Merge sort membagi array menjadi dua secara konsisten dan menggabungkannya dalam O(n), menghasilkan O(n log n) di semua kasus."
      },
      {
        id: "q2-2",
        question: "Apa perbedaan fundamental antara teknik Divide & Conquer dengan Dynamic Programming?",
        options: [
          "Dynamic Programming menyelesaikan overlapping subproblems dengan memoization/tabulasi",
          "Divide & Conquer selalu lebih lambat",
          "Divide & Conquer hanya bisa untuk operasi sorting",
          "Dynamic Programming tidak menggunakan rekursi sama sekali"
        ],
        correctAnswer: 0,
        explanation: "Dynamic programming khusus untuk masalah yang memiliki 'overlapping subproblems' dan 'optimal substructure', menyimpan hasil sub-masalah agar tidak dihitung ulang."
      }
    ]
  }
];
