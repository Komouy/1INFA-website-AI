"use client";

import React, { useState } from "react";
import { 
  BrainCircuit, 
  Play, 
  CheckCircle2, 
  RotateCcw, 
  Inbox
} from "lucide-react";
import { QuizSet, Message } from "@/types";

interface QuizViewProps {
  quizzes: QuizSet[];
  searchQuery: string;
  messages: Message[];
}

export default function QuizView({ quizzes, searchQuery, messages }: QuizViewProps) {
  const [activeQuiz, setActiveQuiz] = useState<QuizSet | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleStartQuiz = (quiz: QuizSet) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
  };

  const handleSelectOption = (optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const calculateScore = () => {
    if (!activeQuiz) return 0;
    let correct = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct += 1;
      }
    });
    return Math.round((correct / activeQuiz.questions.length) * 100);
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
            <BrainCircuit size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)" }}>
              Quiz & Latihan Soal AI
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
              Soal ujian dan kuis yang di-generate dari kisi-kisi dan materi chat dosen
            </p>
          </div>
        </div>

        {activeQuiz && (
          <button
            onClick={() => setActiveQuiz(null)}
            className="kl-btn kl-btn-secondary"
            style={{ fontSize: "12px", padding: "6px 14px" }}
          >
            ← Kembali ke Daftar Kuis
          </button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <div className="kl-card" style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{
            width: "50px",
            height: "50px",
            borderRadius: "16px",
            backgroundColor: "#f1f5f9",
            border: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px auto",
            color: "#94a3b8"
          }}>
            <Inbox size={24} />
          </div>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)", marginBottom: "6px" }}>
            Belum Ada Kuis yang Dibuat
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-dim)", maxWidth: "420px", margin: "0 auto", lineHeight: "1.5" }}>
            Kuis latihan akan di-generate otomatis oleh AI setelah materi perkuliahan atau kisi-kisi ujian masuk di obrolan grup WhatsApp.
          </p>
        </div>
      ) : activeQuiz ? (
        <div className="kl-card" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "14px", borderBottom: "1px solid var(--border)" }}>
            <div>
              <span className="kl-badge kl-badge-primary">{activeQuiz.course}</span>
              <h3 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-main)", marginTop: "4px" }}>
                {activeQuiz.title}
              </h3>
            </div>
            <span style={{ fontSize: "12px", color: "var(--text-dim)", fontFamily: "monospace" }}>
              Soal {currentQuestionIndex + 1} dari {activeQuiz.questions.length}
            </span>
          </div>

          {!isSubmitted ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{
                padding: "16px 18px",
                borderRadius: "12px",
                backgroundColor: "#f8fafc",
                border: "1px solid var(--border)",
                fontSize: "14px",
                fontWeight: "700",
                color: "var(--text-main)",
                lineHeight: "1.5"
              }}>
                {activeQuiz.questions[currentQuestionIndex].question}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {activeQuiz.questions[currentQuestionIndex].options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        backgroundColor: isSelected ? "var(--primary-light)" : "#ffffff",
                        border: `1px solid ${isSelected ? "var(--primary)" : "var(--border)"}`,
                        color: isSelected ? "var(--primary-dark)" : "var(--text-main)",
                        fontWeight: isSelected ? "700" : "500",
                        fontSize: "13px",
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                      }}
                    >
                      <span style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "6px",
                        backgroundColor: isSelected ? "var(--primary)" : "#f1f5f9",
                        color: isSelected ? "#fff" : "var(--text-dim)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "700"
                      }}>
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="kl-btn kl-btn-secondary"
                  style={{ opacity: currentQuestionIndex === 0 ? 0.3 : 1 }}
                >
                  Sebelumnya
                </button>

                {currentQuestionIndex < activeQuiz.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    className="kl-btn kl-btn-primary"
                  >
                    Selanjutnya →
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSubmitted(true)}
                    className="kl-btn kl-btn-primary"
                  >
                    <CheckCircle2 size={15} />
                    <span>Selesai & Cek Nilai</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "20px", padding: "20px 0" }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#ecfdf5",
                border: "2px solid var(--primary)",
                color: "#059669",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                fontWeight: "800",
                margin: "0 auto"
              }}>
                {calculateScore()}
              </div>

              <h4 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text-main)" }}>
                Skor Anda: {calculateScore()}/100
              </h4>

              <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                <button onClick={() => handleStartQuiz(activeQuiz)} className="kl-btn kl-btn-primary">
                  <RotateCcw size={14} />
                  <span>Ulangi Kuis</span>
                </button>
                <button onClick={() => setActiveQuiz(null)} className="kl-btn kl-btn-secondary">
                  Kembali ke Daftar
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="kl-grid-2">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="kl-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px" }}>
              <div>
                <span className="kl-badge kl-badge-primary">{quiz.course}</span>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)", marginTop: "6px", marginBottom: "6px" }}>
                  {quiz.title}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "12px" }}>
                  {quiz.description}
                </p>
              </div>

              <button
                onClick={() => handleStartQuiz(quiz)}
                className="kl-btn kl-btn-primary"
                style={{ width: "100%" }}
              >
                <Play size={14} />
                <span>Mulai Kuis</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
