'use client';

import React, { useState, useEffect } from 'react';
import { getSchedules, createSchedule, deleteSchedule, Schedule } from '@/lib/api';
import { 
  CalendarDays, 
  Plus, 
  Trash2, 
  MapPin, 
  Clock, 
  X
} from 'lucide-react';


const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [subject, setSubject] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Senin');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const data = await getSchedules();
      setSchedules(data);
    } catch (err) {
      console.error("Gagal memuat jadwal", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("Hapus jadwal kuliah ini?")) return;
    try {
      await deleteSchedule(scheduleId);
      loadSchedules();
    } catch (err) {
      alert("Gagal menghapus jadwal");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !startTime || !endTime) return;

    try {
      setSubmitting(true);
      await createSchedule({
        subject,
        day_of_week: dayOfWeek,
        start_time: startTime,
        end_time: endTime,
        location: location || 'Ruang Kuliah'
      });
      setShowAddModal(false);
      setSubject('');
      setLocation('');
      loadSchedules();
    } catch (err) {
      alert("Gagal menambahkan jadwal");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = selectedDay === 'all'
    ? schedules
    : schedules.filter(s => s.day_of_week?.toLowerCase() === selectedDay.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <CalendarDays className="h-7 w-7 text-sky-400" />
            Jadwal Perkuliahan
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Jadwal kelas mingguan otomatis terekam dari WhatsApp / screenshot via Gemini Vision
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-sky-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Tambah Jadwal Manual
        </button>
      </div>

      {/* Day Filter Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto">
        <button
          onClick={() => setSelectedDay('all')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
            selectedDay === 'all' ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Semua Hari ({schedules.length})
        </button>
        {DAYS.map(day => {
          const count = schedules.filter(s => s.day_of_week?.toLowerCase() === day.toLowerCase()).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                selectedDay === day ? 'bg-sky-500/20 text-sky-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {day} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      {/* Schedules Grid */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-500 animate-pulse">
          Memuat jadwal perkuliahan...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 rounded-2xl border border-dashed border-slate-800 text-center">
          <CalendarDays className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-base font-semibold text-slate-300">Belum ada jadwal untuk hari ini</p>
          <p className="text-xs text-slate-500 mt-1">
            Unggah foto screenshot jadwal kuliah pada WhatsApp Simulator untuk mengekstrak otomatis.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((sched) => (
            <div
              key={sched.id}
              className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 shadow-xl space-y-3 transition-all"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-lg bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-400 border border-sky-500/20">
                  {sched.day_of_week || 'Senin'}
                </span>
                <button
                  onClick={() => handleDelete(sched.id)}
                  className="text-slate-500 hover:text-rose-400 p-1"
                  title="Hapus jadwal"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-lg text-white">{sched.subject}</h3>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="h-4 w-4 text-sky-400" />
                  <span>{sched.start_time} - {sched.end_time} WIB</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="h-4 w-4 text-rose-400" />
                  <span>{sched.location || 'Ruang Kuliah'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">Tambah Jadwal Kuliah</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Mata Kuliah</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algoritma & Pemrograman"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Hari Perkuliahan</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                >
                  {DAYS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Ruangan / Lab / Gedung</label>
                <input
                  type="text"
                  placeholder="e.g. Ruang 4S.1 / Lab Komputer 2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
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
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-md shadow-sky-600/20"
                >
                  {submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
