'use client';

import React from 'react';
import WhatsAppSimulator from '@/components/WhatsAppSimulator';
import { Smartphone } from 'lucide-react';



export default function SimulatorPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 mb-2">
            <Smartphone className="h-3.5 w-3.5" />
            WhatsApp Cloud API Simulator
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            1INFA WhatsApp Group Simulator
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Uji alur pesan WhatsApp, ekstraksi teks cerdas, dan deteksi gambar screenshot menggunakan Gemini Vision sebelum beralih ke nomor WhatsApp resmi.
          </p>
        </div>
      </div>

      {/* Full-size Simulator View */}
      <div className="h-[750px] shadow-2xl">
        <WhatsAppSimulator />
      </div>
    </div>
  );
}
