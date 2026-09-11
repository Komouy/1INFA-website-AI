'use client';

import React, { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement, Announcement } from '@/lib/api';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Clock, 
  X,
  Megaphone
} from 'lucide-react';


export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error("Gagal memuat pengumuman", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus pengumuman ini?")) return;
    try {
      await deleteAnnouncement(id);
      loadAnnouncements();
    } catch (err) {
      alert("Gagal menghapus pengumuman");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    try {
      setSubmitting(true);
      await createAnnouncement({ title, content });
      setShowAddModal(false);
      setTitle('');
      setContent('');
      loadAnnouncements();
    } catch (err) {
      alert("Gagal menambahkan pengumuman");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Bell className="h-7 w-7 text-amber-400" />
            Pengumuman Kelas 1INFA
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Siaran informasi dari Dosen, Komti, dan pengurus kelas yang terekam dari WhatsApp
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-amber-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Buat Pengumuman
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 animate-pulse">
          Memuat pengumuman...
        </div>
      ) : announcements.length === 0 ? (
        <div className="py-16 rounded-2xl border border-dashed border-slate-800 text-center">
          <Megaphone className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">Belum ada pengumuman tersimpan</p>
          <p className="text-xs text-slate-500 mt-1">
            Ketik pesan pengumuman pada WhatsApp Simulator untuk mengekstrak pengumuman otomatis.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 shadow-xl space-y-3 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-lg text-white">{item.title}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                    title="Hapus pengumuman"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed pl-10 whitespace-pre-wrap">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">Buat Pengumuman Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gladi Bersih Upacara Fakultas"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Isi Pesan Pengumuman</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Isi lengkap pengumuman untuk seluruh mahasiswa..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-md shadow-amber-600/20"
                >
                  {submitting ? 'Menyimpan...' : 'Siarkan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
