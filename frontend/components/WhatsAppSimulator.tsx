'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  sendSimulatorMessage, 
  sendSimulatorMedia, 
  getSimulatorHistory, 
  MessageLog 
} from '@/lib/api';
import { 
  Send, 
  Image as ImageIcon, 
  Sparkles, 
  CheckCheck, 
  Users, 
  MoreVertical, 
  Phone, 
  Video, 
  Search, 
  Loader2 
} from 'lucide-react';

interface SimulatorProps {
  onDataUpdated?: () => void;
}

const PRESET_MESSAGES = [
  {
    sender: "Budi",
    label: "📝 Tugas Pancasila",
    text: "Guys tugas Pancasila dikumpulkan Jumat depan jam 10 ya."
  },
  {
    sender: "Pak Dosen",
    label: "📅 Jadwal Algoritma",
    text: "Kuliah Algoritma dan Pemrograman hari Senin jam 08.00 sampai 10.00 di Lab Komputer 2."
  },
  {
    sender: "Ketua Tingkat",
    label: "📢 Pengumuman Upacara",
    text: "Pengumuman: Besok gladi bersih upacara fakultas di lapangan utama jam 07.00 pagi."
  },
  {
    sender: "Siti",
    label: "💬 Obrolan Santai",
    text: "Ada yang bawa modul kalkulus hari ini? Mau pinjam sebentar."
  }
];

interface ExtractionResult {
  category?: string;
  extracted?: {
    subject?: string;
    deadline?: string;
    start_time?: string;
    end_time?: string;
    location?: string;
  };
}

export default function WhatsAppSimulator({ onDataUpdated }: SimulatorProps) {
  const [messages, setMessages] = useState<MessageLog[]>([]);
  const [inputText, setInputText] = useState('');
  const [senderName, setSenderName] = useState('Budi');
  const [customSender, setCustomSender] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastExtraction, setLastExtraction] = useState<ExtractionResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await getSimulatorHistory();
      // Reverse to chronological order
      setMessages(history.reverse());
      scrollToBottom();
    } catch (err) {
      console.error("Gagal memuat riwayat", err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const activeSender = customSender.trim() ? customSender.trim() : senderName;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() && !selectedFile) return;

    setIsProcessing(true);
    setLastExtraction(null);

    try {
      if (selectedFile) {
        // Send Media (Screenshot / Vision)
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('sender', activeSender);
        formData.append('caption', text);

        const res = await sendSimulatorMedia(formData);
        setLastExtraction(res);
        setSelectedFile(null);
        setFilePreview(null);
      } else {
        // Send Text Message
        const res = await sendSimulatorMessage(activeSender, text);
        setLastExtraction(res);
      }

      setInputText('');
      await loadHistory();
      if (onDataUpdated) onDataUpdated();
    } catch (err) {
      console.error("Error processing message:", err);
      alert("Gagal memproses pesan via Simulator.");
    } finally {
      setIsProcessing(false);
      scrollToBottom();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setFilePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const getSenderColor = (name: string) => {
    const colors: Record<string, string> = {
      'Budi': 'text-emerald-400',
      'Siti': 'text-amber-400',
      'Pak Dosen': 'text-sky-400',
      'Ketua Tingkat': 'text-purple-400',
      'Dosen': 'text-rose-400'
    };
    return colors[name] || 'text-teal-400';
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-800 bg-[#0b141a] overflow-hidden shadow-2xl">
      {/* WhatsApp Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#1f2c34] border-b border-slate-800 text-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 font-bold text-white shadow">
            <Users className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#1f2c34]" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
              1INFA - Informatika 2026
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Simulator
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Budi, Siti, Pak Dosen, Kamu, +38 lainnya
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-400">
          <Video className="h-4 w-4 hover:text-slate-200 cursor-pointer hidden sm:block" />
          <Phone className="h-4 w-4 hover:text-slate-200 cursor-pointer hidden sm:block" />
          <Search className="h-4 w-4 hover:text-slate-200 cursor-pointer" />
          <MoreVertical className="h-4 w-4 hover:text-slate-200 cursor-pointer" />
        </div>
      </div>

      {/* Preset Quick Chips Bar */}
      <div className="px-4 py-2 bg-[#111b21] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-emerald-400" /> Contoh:
        </span>
        {PRESET_MESSAGES.map((preset, idx) => (
          <button
            key={idx}
            disabled={isProcessing}
            onClick={() => {
              setSenderName(preset.sender);
              setCustomSender('');
              handleSendMessage(preset.text);
            }}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-600/30 hover:text-emerald-200 hover:border-emerald-500/30 text-slate-300 border border-slate-700/60 transition-all"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Real-time AI Extraction Banner (Shows right after sending message) */}
      {lastExtraction && (
        <div className="mx-4 mt-3 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-slate-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-emerald-500/20">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Gemini AI: Terdeteksi {lastExtraction.category?.toUpperCase()}
            </span>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              Tersimpan ke DB
            </span>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
            {lastExtraction.extracted?.subject && (
              <div>
                <span className="text-slate-400">Mata Kuliah:</span>{' '}
                <strong className="text-slate-100">{lastExtraction.extracted.subject}</strong>
              </div>
            )}
            {lastExtraction.extracted?.deadline && (
              <div>
                <span className="text-slate-400">Deadline:</span>{' '}
                <strong className="text-amber-300">{lastExtraction.extracted.deadline}</strong>
              </div>
            )}
            {lastExtraction.extracted?.start_time && (
              <div>
                <span className="text-slate-400">Waktu:</span>{' '}
                <strong className="text-sky-300">{lastExtraction.extracted.start_time} - {lastExtraction.extracted.end_time}</strong>
              </div>
            )}
            {lastExtraction.extracted?.location && (
              <div>
                <span className="text-slate-400">Ruangan:</span>{' '}
                <strong className="text-slate-100">{lastExtraction.extracted.location}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 wa-bg-pattern">
        {/* Encryption notice */}
        <div className="flex justify-center">
          <div className="rounded-lg bg-[#182229] px-3 py-1.5 text-center text-[11px] text-amber-300/80 border border-amber-500/10 max-w-md shadow-sm">
            🔒 Pesan simulasi diproses secara lokal dan dianalisis langsung oleh Gemini AI untuk diekstrak ke dashboard kelas.
          </div>
        </div>

        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-xs text-center">
            <Users className="h-8 w-8 text-slate-600 mb-2" />
            <p>Belum ada pesan di grup.</p>
            <p className="mt-1 text-[11px]">Ketik pesan atau pilih salah satu tombol contoh di atas.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender === 'Kamu' || msg.sender === 'Saya';
            const timeFormatted = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2 text-sm shadow-md ${
                    isMe
                      ? 'bg-[#005c4b] text-slate-100 rounded-tr-none'
                      : 'bg-[#202c33] text-slate-200 rounded-tl-none'
                  }`}
                >
                  {/* Sender Name */}
                  {!isMe && (
                    <div className={`text-xs font-bold mb-1 ${getSenderColor(msg.sender)}`}>
                      {msg.sender}
                    </div>
                  )}

                  {/* Image Attachment if available */}
                  {msg.media_url && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-slate-700/50 bg-slate-900/60 max-h-56">
                      <img 
                        src={`http://localhost:8000${msg.media_url}`} 
                        alt="Screenshot" 
                        className="w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Message Content */}
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                  {/* Timestamp & double checkmarks */}
                  <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    <span>{timeFormatted}</span>
                    <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                </div>
              </div>
            );
          })
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-slate-900/80 px-3 py-1.5 rounded-full w-fit border border-emerald-500/20 animate-pulse">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>Gemini AI sedang menganalisis pesan...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Selected Image Preview before sending */}
      {filePreview && (
        <div className="px-4 py-2 bg-[#1f2c34] border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <img src={filePreview} alt="Preview" className="h-10 w-10 object-cover rounded-lg border border-slate-700" />
            <span>Foto/Screenshot siap dikirim (Gemini Vision)</span>
          </div>
          <button 
            onClick={() => { setSelectedFile(null); setFilePreview(null); }}
            className="text-rose-400 hover:text-rose-300 font-semibold"
          >
            Batal
          </button>
        </div>
      )}

      {/* Bottom Input Area */}
      <div className="p-3 bg-[#202c33] border-t border-slate-800 space-y-2">
        {/* Sender selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 shrink-0">Kirim sebagai:</span>
          <select
            value={senderName}
            onChange={(e) => {
              setSenderName(e.target.value);
              setCustomSender('');
            }}
            className="rounded-lg bg-[#111b21] border border-slate-700 px-2 py-1 text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="Budi">Budi (Mahasiswa)</option>
            <option value="Siti">Siti (Mahasiswi)</option>
            <option value="Pak Dosen">Pak Dosen</option>
            <option value="Ketua Tingkat">Ketua Tingkat</option>
            <option value="Kamu">Kamu (Saya)</option>
            <option value="Custom">Nama Lainnya...</option>
          </select>

          {senderName === 'Custom' && (
            <input
              type="text"
              placeholder="Nama Pengirim..."
              value={customSender}
              onChange={(e) => setCustomSender(e.target.value)}
              className="rounded-lg bg-[#111b21] border border-slate-700 px-2 py-1 text-slate-200 text-xs w-32 focus:outline-none focus:border-emerald-500"
            />
          )}
        </div>

        {/* Message Input & Action Buttons */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* File attachment input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Kirim Screenshot Jadwal / Pengumuman"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111b21] text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
          >
            <ImageIcon className="h-5 w-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={selectedFile ? "Tambah keterangan gambar..." : "Ketik pesan WhatsApp di sini..."}
            disabled={isProcessing}
            className="flex-1 rounded-xl bg-[#111b21] border border-slate-700/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />

          <button
            type="submit"
            disabled={isProcessing || (!inputText.trim() && !selectedFile)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all shadow-md shadow-emerald-600/20"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
