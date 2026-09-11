import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  description?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'indigo' | 'amber' | 'sky' | 'rose';
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color = 'emerald'
}: StatCardProps) {
  const colorMap = {
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      glow: 'shadow-emerald-500/10'
    },
    indigo: {
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      bg: 'bg-indigo-500/10',
      text: 'text-indigo-400',
      glow: 'shadow-indigo-500/10'
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      glow: 'shadow-amber-500/10'
    },
    sky: {
      border: 'border-sky-500/20 hover:border-sky-500/40',
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      glow: 'shadow-sky-500/10'
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      glow: 'shadow-rose-500/10'
    }
  };

  const c = colorMap[color];

  return (
    <div className={`group relative overflow-hidden rounded-2xl border ${c.border} bg-slate-900/60 p-5 backdrop-blur-xl shadow-lg ${c.glow} transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white">{value}</span>
      </div>
      {description && (
        <p className="mt-1 text-xs text-slate-400">{description}</p>
      )}
    </div>
  );
}
