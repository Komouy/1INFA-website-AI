'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getHealthStatus } from '@/lib/api';
import { Database, Sparkles, Smartphone } from 'lucide-react';


export default function Navbar() {
  const [health, setHealth] = useState<{ storage?: string; gemini_configured?: boolean; status?: string } | null>(null);

  useEffect(() => {
    getHealthStatus()
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline' }));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 font-bold text-lg">
            1I
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white sm:text-lg">Class AI</span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                1INFA MVP
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">WhatsApp Group Bot & Academic Dashboard</p>
          </div>
        </div>

        {/* Status Indicators & Simulator Button */}
        <div className="flex items-center gap-3">
          {/* Database Mode Badge */}
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs border border-slate-800 text-slate-300">
            <Database className="h-3.5 w-3.5 text-indigo-400" />
            <span>DB:</span>
            <span className="font-semibold text-white capitalize">{health?.storage || 'SQLite'}</span>
          </div>

          {/* AI Engine Badge */}
          <div className="hidden md:flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs border border-slate-800 text-slate-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>AI:</span>
            <span className="font-semibold text-emerald-400">Gemini Flash</span>
          </div>

          {/* Status Dot */}
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-2.5 py-1 text-xs border border-slate-800 text-slate-300">
            <span className={`h-2 w-2 rounded-full ${health?.status === 'healthy' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="hidden sm:inline">{health?.status === 'healthy' ? 'Backend Aktif' : 'Menghubungkan...'}</span>
          </div>

          {/* Direct CTA to Simulator */}
          <Link
            href="/simulator"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/25 transition-all hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/35"
          >
            <Smartphone className="h-4 w-4" />
            <span>Buka WA Simulator</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
