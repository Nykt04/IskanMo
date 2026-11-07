'use client';

import React from 'react';
import { WifiOff, RefreshCw, Calendar } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#09090b] text-center">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-zinc-900/80 shadow-[0_0_40px_rgba(99,102,241,0.2)] backdrop-blur-xl">
        <WifiOff className="h-9 w-9 text-indigo-400" />
      </div>

      <div className="mt-6 max-w-sm space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-white">
          You're currently offline
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          IskanMo cached your app shell and timetable locally. Once your
          internet reconnects, you can scan new schedules and sync seamlessly.
        </p>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-[0_0_20px_rgba(99,102,241,0.35)] transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>

        <a
          href="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-white/5 transition"
        >
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span>Go to Saved Schedule</span>
        </a>
      </div>
    </div>
  );
}
