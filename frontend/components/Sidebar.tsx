'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Smartphone, 
  CheckSquare, 
  CalendarDays, 
  Bell, 
  MessageSquareText, 
  GraduationCap
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard, badge: null },
  { href: '/simulator', label: 'WA Simulator', icon: Smartphone, badge: 'Live AI' },
  { href: '/tasks', label: 'Tugas Kuliah', icon: CheckSquare, badge: null },
  { href: '/schedules', label: 'Jadwal Kuliah', icon: CalendarDays, badge: null },
  { href: '/announcements', label: 'Pengumuman', icon: Bell, badge: null },
  { href: '/chat', label: 'Tanya AI Bot', icon: MessageSquareText, badge: 'Smart' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 border-r border-slate-800/80 bg-slate-950/60 p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Class Profile Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 to-slate-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white">Kelas 1-INFA</h2>
              <p className="text-xs text-slate-400">Teknik Informatika</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-800/60 pt-3 text-xs text-slate-400">
            <span>Semester: <strong className="text-slate-200">Ganjil 2026</strong></span>
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Aktif
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Menu Utama
          </div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold shadow-sm'
                    : 'text-slate-400 hover:bg-slate-900/80 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Info card footer */}
      <div className="mt-6 rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-xs text-slate-400">
        <p className="font-medium text-slate-300">Alur Pesan MVP</p>
        <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
          WA / Simulator → Gemini AI → SQLite/Supabase → Dashboard.
        </p>
      </div>
    </aside>
  );
}
