'use client';

import React, { useState, useEffect } from 'react';
import { getTasks, updateTaskStatus, deleteTask, createTask, Task } from '@/lib/api';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Search, 
  X
} from 'lucide-react';


export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks(filter === 'all' ? undefined : filter);
      setTasks(data);
    } catch (err) {
      console.error("Gagal memuat tugas", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (taskId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await updateTaskStatus(taskId, nextStatus);
      loadTasks();
    } catch (err) {
      alert("Gagal memperbarui status tugas");
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("Hapus tugas ini dari database?")) return;
    try {
      await deleteTask(taskId);
      loadTasks();
    } catch (err) {
      alert("Gagal menghapus tugas");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !title || !deadline) return;

    try {
      setSubmitting(true);
      await createTask({ subject, title, deadline, description });
      setShowAddModal(false);
      setSubject('');
      setTitle('');
      setDeadline('');
      setDescription('');
      loadTasks();
    } catch (err) {
      alert("Gagal menambahkan tugas");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CheckSquare className="h-7 w-7 text-emerald-400" />
            Tugas & Deadline Kuliah
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Daftar tugas otomatis dari WhatsApp atau input manual mahasiswa
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Tugas Manual
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'all' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Semua ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'pending' ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Belum Selesai
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Selesai
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Cari matkul atau judul..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-800 pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 animate-pulse">
          Memuat daftar tugas...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-16 rounded-2xl border border-dashed border-slate-800 text-center">
          <CheckSquare className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">Tidak ada tugas yang ditemukan</p>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan WhatsApp Simulator untuk mengekstrak tugas baru, atau klik Tambah Tugas Manual.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`p-5 rounded-2xl border transition-all ${
                task.status === 'completed'
                  ? 'border-slate-800/40 bg-slate-950/40 opacity-70'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    className="mt-1 text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <span className="inline-block rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                      {task.subject}
                    </span>
                    <h3 className={`font-bold text-base ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-400 leading-relaxed pt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  title="Hapus tugas"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  Deadline: {new Date(task.deadline).toLocaleString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>

                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {task.status === 'completed' ? 'Selesai' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">Tambah Tugas Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mata Kuliah</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pancasila, Pemrograman Web"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Judul Tugas</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Makalah Etika Profesi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Batas Waktu (Deadline)</label>
                <input
                  type="datetime-local"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Deskripsi / Keterangan</label>
                <textarea
                  rows={3}
                  placeholder="Instruksi tugas, format pengumpulan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md shadow-emerald-600/20"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Tugas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
