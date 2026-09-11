'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getDashboardStats, 
  updateTaskStatus, 
  DashboardStats 
} from '@/lib/api';
import StatCard from '@/components/StatCard';
import WhatsAppSimulator from '@/components/WhatsAppSimulator';
import { 
  CheckSquare, 
  CalendarDays, 
  Bell, 
  Database, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  Smartphone,
  ChevronRight,
  RefreshCw
} from 'lucide-react';


export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Gagal memuat stats:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await updateTaskStatus(taskId, nextStatus);
      fetchStats();
    } catch (err) {
      console.error("Gagal update status tugas", err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              Sistem Otomasi Grup WhatsApp 1INFA
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Halo, Mahasiswa 1INFA 👋
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Semua tugas, jadwal perkuliahan, dan pengumuman dari grup WhatsApp diekstrak secara otomatis oleh <strong className="text-slate-200">Gemini AI</strong> dan disimpan terstruktur ke database.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchStats}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-200 border border-slate-700 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            <Link
              href="/simulator"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Smartphone className="h-4 w-4" />
              Simulasi WhatsApp
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Tugas Perkuliahan"
          value={stats?.total_tasks ?? 0}
          description={`${stats?.pending_tasks ?? 0} tugas belum selesai`}
          icon={CheckSquare}
          color="emerald"
        />
        <StatCard
          title="Jadwal Perkuliahan"
          value={stats?.total_schedules ?? 0}
          description="Sesi kelas terdaftar minggu ini"
          icon={CalendarDays}
          color="sky"
        />
        <StatCard
          title="Pengumuman Kelas"
          value={stats?.total_announcements ?? 0}
          description="Info penting komti & dosen"
          icon={Bell}
          color="amber"
        />
        <StatCard
          title="Penyimpanan Data"
          value={stats?.storage_mode?.toUpperCase() || 'SQLITE'}
          description="Persisten & Siap Supabase"
          icon={Database}
          color="indigo"
        />
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Academic Intelligence (Tasks, Schedules, Announcements) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section: Deadline Terdekat */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Deadline Terdekat</h2>
                  <p className="text-xs text-slate-400">Prioritas tugas yang harus segera dikumpulkan</p>
                </div>
              </div>
              <Link
                href="/tasks"
                className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Lihat Semua <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-500 animate-pulse">
                Memuat deadline perkuliahan...
              </div>
            ) : !stats?.upcoming_deadlines || stats.upcoming_deadlines.length === 0 ? (
              <div className="py-8 rounded-xl border border-dashed border-slate-800 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">Semua tugas beres!</p>
                <p className="text-xs text-slate-500 mt-1">
                  Belum ada deadline tugas pending. Coba kirim pesan tugas via WhatsApp Simulator.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcoming_deadlines.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-start justify-between p-4 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:bg-slate-800/40 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleTask(task.id, task.status)}
                        className="mt-0.5 text-slate-500 hover:text-emerald-400 transition-colors"
                        title="Tandai selesai"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                            {task.subject}
                          </span>
                          <h3 className="font-semibold text-sm text-slate-100">{task.title}</h3>
                        </div>
                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 border border-amber-500/20">
                        <Clock className="h-3 w-3" />
                        {new Date(task.deadline).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Jadwal Kuliah */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                  <CalendarDays className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Jadwal Perkuliahan</h2>
                  <p className="text-xs text-slate-400">Jadwal mingguan & ruang perkuliahan kelas</p>
                </div>
              </div>
              <Link
                href="/schedules"
                className="flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
              >
                Lihat Kalender <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {!stats?.schedules || stats.schedules.length === 0 ? (
              <div className="py-8 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Belum ada jadwal kuliah yang tercatat. Kirim foto screenshot jadwal kuliah via Simulator!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.schedules.slice(0, 4).map((sched) => (
                  <div
                    key={sched.id}
                    className="p-3.5 rounded-xl border border-slate-800/60 bg-slate-950/40 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{sched.subject}</span>
                      <span className="font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px]">
                        {sched.day_of_week || 'Senin'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {sched.start_time} - {sched.end_time}
                      </span>
                      <span className="flex items-center gap-1 text-slate-300">
                        <MapPin className="h-3 w-3 text-rose-400" />
                        {sched.location || 'Ruang Kuliah'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Pengumuman Terbaru */}
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-white">Pengumuman Terkini</h2>
                  <p className="text-xs text-slate-400">Pesan siaran resmi dari ketua tingkat & dosen</p>
                </div>
              </div>
              <Link
                href="/announcements"
                className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
              >
                Semua Pengumuman <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {!stats?.recent_announcements || stats.recent_announcements.length === 0 ? (
              <div className="py-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                Belum ada pengumuman baru.
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recent_announcements.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-800/60 bg-slate-950/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm text-slate-200">{item.title}</h3>
                      <span className="text-[10px] text-slate-500">
                        {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Embedded WhatsApp Simulator */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-emerald-400" />
              <h2 className="font-bold text-base text-white">WhatsApp Simulator</h2>
            </div>
            <span className="text-xs text-slate-400">Ketik pesan / Kirim screenshot</span>
          </div>

          <div className="h-[680px]">
            <WhatsAppSimulator onDataUpdated={fetchStats} />
          </div>
        </div>
      </div>
    </div>
  );
}
