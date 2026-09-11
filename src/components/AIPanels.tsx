"use client";

// Placeholder panel AI — akan diisi di Phase 6
// Untuk saat ini ditampilkan sebagai tab kosong dengan pesan coming soon

interface PlaceholderPanelProps {
  icon: string;
  title: string;
  description: string;
}

function PlaceholderPanel({ icon, title, description }: PlaceholderPanelProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 max-w-xs">{description}</p>
      <div className="mt-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/30">
        Segera hadir di Phase 6 ✨
      </div>
    </div>
  );
}

export function ChatPanel() {
  return (
    <PlaceholderPanel
      icon="💬"
      title="Chat dengan AI"
      description="Tanyakan apa saja tentang isi grup. AI akan menjawab berdasarkan pesan yang tersimpan."
    />
  );
}

export function SummaryPanel() {
  return (
    <PlaceholderPanel
      icon="📝"
      title="Rangkuman Pesan"
      description="AI merangkum semua pesan hari ini atau minggu ini secara otomatis."
    />
  );
}

export function RemindersPanel() {
  return (
    <PlaceholderPanel
      icon="⏰"
      title="Reminder & Deadline"
      description="AI mendeteksi tugas dan deadline dari pesan grup dan menampilkannya dalam daftar terstruktur."
    />
  );
}

export function QuizPanel() {
  return (
    <PlaceholderPanel
      icon="🧠"
      title="Quiz dari Materi"
      description="AI membuat soal quiz dari materi dan pengumuman yang ada di grup kelas."
    />
  );
}
