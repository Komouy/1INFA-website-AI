import React, { useState } from "react";
import { 
  Megaphone, 
  Wallet, 
  Shirt, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Tag, 
  Pin,
  MessageCircle,
  X
} from "lucide-react";
import { BulletinItem } from "@/types";

interface BulletinViewProps {
  bulletins: BulletinItem[];
  onAddBulletin: (item: Omit<BulletinItem, "id">) => Promise<void>;
  onDeleteBulletin: (id: string) => Promise<void>;
  searchQuery: string;
}

export default function BulletinView({
  bulletins,
  onAddBulletin,
  onDeleteBulletin,
  searchQuery
}: BulletinViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isAdding, setIsAdding] = useState<boolean>(false);

  // Form manual
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<"kas" | "pdh" | "buku" | "pengumuman" | "random">("random");
  const [newContent, setNewContent] = useState("");
  const [newHighlight, setNewHighlight] = useState("");

  const handleAddBulletin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const categoryTags: Record<string, string> = {
      kas: "Pengingat Kas",
      pdh: "Baju PDH",
      buku: "Buku Kuliah",
      pengumuman: "Pengumuman",
      random: "Info Santai"
    };

    await onAddBulletin({
      title: newTitle.trim(),
      category: newCategory,
      content: newContent.trim(),
      tag: categoryTags[newCategory] || "Info Tambahan",
      highlight: newHighlight.trim() || undefined,
      date: new Date().toLocaleDateString("id-ID"),
    });
    setNewTitle("");
    setNewContent("");
    setNewHighlight("");
    setIsAdding(false);
  };

  const filteredItems = bulletins.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.highlight && item.highlight.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeCategory === "all") return true;
    if (activeCategory === "kas" && item.category === "kas") return true;
    if (activeCategory === "pdh_buku" && (item.category === "pdh" || item.category === "buku")) return true;
    if (activeCategory === "random" && (item.category === "pengumuman" || item.category === "random")) return true;
    return false;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "kas":
        return { bg: "#ecfdf5", border: "#a7f3d0", color: "#047857", icon: Wallet, label: "Uang Kas" };
      case "pdh":
        return { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8", icon: Shirt, label: "Baju PDH" };
      case "buku":
        return { bg: "#fef3c7", border: "#fde68a", color: "#b45309", icon: BookOpen, label: "Buku/Modul" };
      default:
        return { bg: "#f3e8ff", border: "#e9d5ff", color: "#7e22ce", icon: Megaphone, label: "Pengumuman / Random" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ─── Top Banner ─── */}
      <div className="kl-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
          }}>
            <Megaphone size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-main)" }}>
              Papan Info, Kas & Mading Kelas 1INFA
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-dim)", marginTop: "2px" }}>
              Pusat pengingat uang kas, info baju PDH, buku, dan info santai/random angkatan
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="kl-btn kl-btn-primary"
          style={{ height: "38px" }}
        >
          <Plus size={15} />
          <span>Tambah Catatan Info</span>
        </button>
      </div>

      {/* ─── Quick Highlight Summary Cards ─── */}
      <div className="kl-grid-3">
        {/* Card 1: Uang Kas */}
        <div className="kl-card" style={{ borderLeft: "4px solid #10b981", backgroundColor: "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "#ecfdf5", color: "#059669" }}>
              <Wallet size={16} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase" }}>
              Uang Kas 1INFA
            </span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "#047857", marginBottom: "4px" }}>
            5k / mgg <span style={{ fontSize: "13px", fontWeight: "500", color: "var(--text-dim)" }}>atau 20k / bln</span>
          </div>
          <p style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
            Iuran rutin untuk fotokopi modul & kas bersama kelas.
          </p>
        </div>

        {/* Card 2: Baju PDH */}
        <div className="kl-card" style={{ borderLeft: "4px solid #2563eb", backgroundColor: "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "#eff6ff", color: "#2563eb" }}>
              <Shirt size={16} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase" }}>
              Baju PDH Informatika A
            </span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "#1d4ed8", marginBottom: "4px" }}>
            ± Rp 135.000
          </div>
          <p style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
            Seragam PDH resmi angkatan Informatika A.
          </p>
        </div>

        {/* Card 3: Info & Mading Santai */}
        <div className="kl-card" style={{ borderLeft: "4px solid #d97706", backgroundColor: "#ffffff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ padding: "6px", borderRadius: "8px", backgroundColor: "#fef3c7", color: "#d97706" }}>
              <Sparkles size={16} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--text-dim)", textTransform: "uppercase" }}>
              Mading & Info Santai
            </span>
          </div>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "#b45309", marginBottom: "4px" }}>
            Bebas & Terupdate
          </div>
          <p style={{ fontSize: "11.5px", color: "var(--text-dim)" }}>
            Lomba, webinar, info kampus & obrolan santai kelas.
          </p>
        </div>
      </div>

      {/* ─── Modal Form Tambah Catatan Manual ─── */}
      {isAdding && (
        <div className="kl-card" style={{ border: "2px dashed #10b981", backgroundColor: "#f0fdf4" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#047857", display: "flex", alignItems: "center", gap: "6px" }}>
              <Plus size={15} /> Tambah Catatan Pengingat / Info Santai Baru
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleAddBulletin} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Judul Info / Pengingat
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Contoh: Info Pembelian Modul Lab Basis Data"
                  className="kl-input"
                  style={{ width: "100%" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                  Kategori
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="kl-input"
                  style={{ width: "100%" }}
                >
                  <option value="kas">Uang Kas & Iuran</option>
                  <option value="pdh">Baju PDH / Jaket</option>
                  <option value="buku">Buku / Modul Kuliah</option>
                  <option value="pengumuman">Pengumuman Resmi</option>
                  <option value="random">Info Santai / Random</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                Highlight Singkat (Opsional)
              </label>
              <input
                type="text"
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Contoh: Rp 35.000 atau Penting"
                className="kl-input"
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>
                Rincian Informasi
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Tuliskan info lengkapnya di sini..."
                className="kl-input"
                style={{ width: "100%", height: "80px", resize: "vertical" }}
                required
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="kl-btn kl-btn-secondary"
                style={{ padding: "8px 16px" }}
              >
                Batal
              </button>
              <button
                type="submit"
                className="kl-btn kl-btn-primary"
                style={{ padding: "8px 20px" }}
              >
                Simpan Catatan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── Filter Pills ─── */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {[
          { id: "all", label: "Semua Info", icon: null },
          { id: "kas", label: "Uang Kas", icon: Wallet },
          { id: "pdh_buku", label: "Baju PDH & Buku", icon: Shirt },
          { id: "random", label: "Pengumuman & Random", icon: Megaphone }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "12.5px",
              fontWeight: "600",
              border: "1px solid",
              borderColor: activeCategory === tab.id ? "var(--primary)" : "var(--border)",
              backgroundColor: activeCategory === tab.id ? "var(--primary-light)" : "#ffffff",
              color: activeCategory === tab.id ? "var(--primary-dark)" : "var(--text-dim)",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {tab.icon && <tab.icon size={13} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── Bulletin Card List ─── */}
      {filteredItems.length === 0 ? (
        <div className="kl-card" style={{ padding: "48px 20px", textAlign: "center" }}>
          <Megaphone size={32} style={{ margin: "0 auto 12px auto", color: "#94a3b8" }} />
          <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-main)", marginBottom: "4px" }}>
            Belum Ada Informasi di Kategori Ini
          </h3>
          <p style={{ fontSize: "12px", color: "var(--text-dim)", maxWidth: "340px", margin: "0 auto 16px auto" }}>
            Informasi pengingat uang kas, baju PDH, buku, atau pengumuman dari grup WhatsApp akan dirangkum di sini.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
          {filteredItems.map((item) => {
            const badge = getCategoryBadge(item.category);
            const Icon = badge.icon;

            return (
              <div
                key={item.id}
                className="kl-card kl-card-interactive"
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "14px" }}
              >
                <div>
                  {/* Top Header Card */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "8px",
                      backgroundColor: badge.bg,
                      border: `1px solid ${badge.border}`,
                      color: badge.color,
                      fontSize: "11px",
                      fontWeight: "700"
                    }}>
                      <Icon size={12} />
                      <span>{item.tag || badge.label}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {item.highlight && (
                        <span style={{
                          fontSize: "12px",
                          fontWeight: "800",
                          color: "#059669",
                          backgroundColor: "#ecfdf5",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          border: "1px solid #a7f3d0"
                        }}>
                          {item.highlight}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDeleteBulletin(item.id); }}
                        title="Hapus catatan ini"
                        style={{
                          background: "none",
                          border: "1px solid #e2e8f0",
                          borderRadius: "6px",
                          cursor: "pointer",
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          padding: "3px",
                          flexShrink: 0,
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          const btn = e.currentTarget;
                          btn.style.color = "#e11d48";
                          btn.style.borderColor = "#fca5a5";
                          btn.style.backgroundColor = "#fff1f2";
                        }}
                        onMouseLeave={(e) => {
                          const btn = e.currentTarget;
                          btn.style.color = "#94a3b8";
                          btn.style.borderColor = "#e2e8f0";
                          btn.style.backgroundColor = "transparent";
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-main)", marginBottom: "8px", lineHeight: "1.4" }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: "12.5px", color: "var(--text-muted)", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                    {item.content}
                  </p>
                </div>

                {/* Source Message Footer */}
                {item.sourceMessage && (
                  <div style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    backgroundColor: "#f8fafc",
                    borderLeft: "3px solid #cbd5e1",
                    fontSize: "11px",
                    color: "var(--text-dim)",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    <MessageCircle size={13} style={{ flexShrink: 0 }} />
                    <span style={{ fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      "{item.sourceMessage}"
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
