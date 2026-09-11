'use client';

import React, { useState, useRef, useEffect } from 'react';
import { askAiChat } from '@/lib/api';
import { 
  Bot, 
  Send, 
  User, 
  Sparkles, 
  Loader2 
} from 'lucide-react';


interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

const SUGGESTIONS = [
  "Tugas apa saja yang deadline minggu ini?",
  "Jadwal kuliah apa saja yang terdaftar?",
  "Apakah ada tugas Pancasila atau Algoritma?",
  "Ada pengumuman apa saja dari ketua kelas?"
];

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Halo! Saya asisten AI untuk kelas 1INFA 🤖\n\nSaya dapat membantu memeriksa tugas yang harus dikumpulkan, batas waktu deadline, jadwal perkuliahan, atau informasi pengumuman kelas yang terekam dari WhatsApp. Apa yang ingin kamu tanyakan?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputQuery;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await askAiChat(query);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply || "Maaf, saya tidak dapat menemukan data terkait.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Maaf, terjadi gangguan saat menghubungi server AI. Pastikan backend FastAPI sedang berjalan.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Tanya AI Kelas 1INFA
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                Gemini Powered
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Menjawab pertanyaan akademik mahasiswa berdasarkan data aktif Supabase & SQLite
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 text-xs">
        <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-emerald-400" /> Contoh:
        </span>
        {SUGGESTIONS.map((sug, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(sug)}
            className="shrink-0 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-3 py-1.5 transition-all hover:border-emerald-500/30 hover:text-emerald-300"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl p-5 overflow-y-auto space-y-4 shadow-xl">
        {messages.map((m) => {
          const isAi = m.sender === 'ai';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                  isAi
                    ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {isAi ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-md leading-relaxed whitespace-pre-wrap ${
                  isAi
                    ? 'bg-slate-950 border border-slate-800 text-slate-200'
                    : 'bg-emerald-600 text-white font-medium'
                }`}
              >
                {m.text}
                <div className={`mt-1.5 text-[10px] text-right ${isAi ? 'text-slate-500' : 'text-emerald-200'}`}>
                  {m.time}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div className="rounded-2xl bg-slate-950 border border-slate-800 px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
              <span>Gemini sedang mencari jawaban dari database kelas...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Query Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Tanyakan tugas, deadline, atau jadwal kuliah ke AI..."
          disabled={loading}
          className="flex-1 rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
        />

        <button
          type="submit"
          disabled={loading || !inputQuery.trim()}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-600/25"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
