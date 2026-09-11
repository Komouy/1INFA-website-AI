"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  BotMessageSquare, 
  SendHorizontal, 
  Sparkles, 
  Trash2, 
  User, 
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { AIChatMessage, Message } from "@/types";
import { askClassAI } from "@/services/aiService";

interface ChatAiViewProps {
  messages: Message[];
  chatHistory: AIChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<AIChatMessage[]>>;
}

export default function ChatAiView({ messages, chatHistory, setChatHistory }: ChatAiViewProps) {
  const [inputPrompt, setInputPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Apa saja deadline tugas yang ada di grup?",
    "Ada perubahan jadwal kuliah apa minggu ini?",
    "Rangkumkan poin materi perkuliahan kemarin",
    "Ada info pengumuman penting apa dari dosen?"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputPrompt;
    if (!query.trim() || isTyping) return;

    setApiError(null);
    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Tambahkan pesan user + placeholder AI kosong untuk streaming
    const aiMsgId = `ai-${Date.now()}`;
    const aiPlaceholder: AIChatMessage = {
      id: aiMsgId,
      sender: "ai",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, userMsg, aiPlaceholder]);
    if (!textToSend) setInputPrompt("");
    setIsTyping(true);

    try {
      // Streaming: update teks AI secara real-time chunk per chunk
      await askClassAI(query, messages, (streamedText) => {
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId ? { ...msg, text: streamedText } : msg
          )
        );
      });
    } catch (err: any) {
      console.error("Chat error:", err);
      setApiError(err.message);
      setChatHistory((prev) =>
        prev.map((msg) =>
          msg.id === aiMsgId
            ? { ...msg, text: `**Pemberitahuan:** ${err.message}` }
            : msg
        )
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([{
      id: "ai-reset",
      sender: "ai",
      text: "Percakapan telah dibersihkan. Ada yang ingin kamu tanyakan mengenai kelas?",
      timestamp: "Baru saja",
    }]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div className="kl-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            backgroundColor: "#ecfdf5",
            color: "#10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <BotMessageSquare size={22} />
          </div>
        <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
              Tanya AI Asisten Kelas
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
              {import.meta.env.VITE_GROQ_API_KEY
                ? "⚡ Groq · llama-3.3-70b (Gratis & Cepat)"
                : "✦ Gemini 3.6 Flash"
              } · {messages.length} pesan WhatsApp
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="kl-btn kl-btn-secondary"
          style={{ fontSize: "12px", padding: "6px 12px" }}
        >
          <Trash2 size={13} />
          <span>Bersihkan Chat</span>
        </button>
      </div>

      {apiError && (
        <div style={{
          padding: "12px 16px",
          borderRadius: "12px",
          backgroundColor: "#fff1f2",
          border: "1px solid #fecdd3",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "12.5px",
          color: "#be123c"
        }}>
          <AlertCircle size={16} />
          <span>{apiError}</span>
        </div>
      )}

      {/* Main Chat Box */}
      <div className="kl-card" style={{ display: "flex", flexDirection: "column", height: "540px", padding: "20px" }}>
        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "14px", paddingRight: "8px" }}>
          {chatHistory.map((msg) => {
            const isAI = msg.sender === "ai";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                  justifyContent: isAI ? "flex-start" : "flex-end"
                }}
              >
                {isAI && (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    backgroundColor: "#10b981",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <Sparkles size={16} />
                  </div>
                )}

                <div style={{
                  maxWidth: "80%",
                  padding: "12px 16px",
                  borderRadius: "14px",
                  backgroundColor: isAI ? "#f8fafc" : "var(--primary)",
                  border: `1px solid ${isAI ? "var(--border)" : "transparent"}`,
                  color: isAI ? "var(--text-main)" : "#ffffff",
                  fontSize: "13px",
                  lineHeight: "1.5"
                }}>
                  {/* Tampilkan teks dengan efek kursor blink saat streaming */}
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {msg.text}
                    {isAI && isTyping && msg.text === "" && (
                      <span style={{ display: "inline-flex", gap: "3px", alignItems: "center" }}>
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#94a3b8", animation: "bounce 1s infinite 0s" }} />
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#94a3b8", animation: "bounce 1s infinite 0.2s" }} />
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#94a3b8", animation: "bounce 1s infinite 0.4s" }} />
                      </span>
                    )}
                    {isAI && isTyping && msg.text !== "" && (
                      <span style={{ display: "inline-block", width: "2px", height: "14px", background: "#10b981", marginLeft: "2px", verticalAlign: "middle", animation: "blink 0.8s step-end infinite" }} />
                    )}
                  </div>
                  <div style={{ fontSize: "10.5px", color: isAI ? "var(--text-dim)" : "rgba(255,255,255,0.8)", textAlign: "right", marginTop: "4px", fontFamily: "monospace" }}>
                    {msg.timestamp}
                  </div>
                </div>

                {!isAI && (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    backgroundColor: "#e2e8f0",
                    color: "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: "flex", gap: "6px", overflowX: "auto", padding: "12px 0 8px 0", borderTop: "1px solid var(--border)" }}>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              disabled={isTyping}
              onClick={() => handleSendMessage(prompt)}
              style={{
                padding: "6px 12px",
                borderRadius: "8px",
                backgroundColor: "#f8fafc",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontSize: "11.5px",
                whiteSpace: "nowrap",
                cursor: isTyping ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                opacity: isTyping ? 0.5 : 1
              }}
            >
              <HelpCircle size={12} color="#10b981" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{ display: "flex", gap: "10px", paddingTop: "8px" }}
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={isTyping ? "AI sedang mengetik..." : "Tanyakan tugas, jadwal, atau materi kuliah..."}
            className="kl-input"
            style={{ flex: 1, height: "42px" }}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isTyping}
            className="kl-btn kl-btn-primary"
            style={{ height: "42px", padding: "0 18px" }}
          >
            <SendHorizontal size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
