'use client';

import React from 'react';

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export const ScheduleSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 space-y-4">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-2.5">
          <div className="h-2 w-2 rounded-full bg-zinc-400 animate-pulse" />
          <span className="text-xs text-zinc-300 font-medium">
            Analyzing timetable and extracting course sessions...
          </span>
        </div>
        <div className="h-1.5 w-20 sm:w-24 rounded-full skeleton-shimmer overflow-hidden" />
      </div>

      {/* Responsive Calendar Skeleton */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
        {/* Desktop Header */}
        <div className="hidden sm:grid grid-cols-[52px_repeat(5,1fr)] border-b border-zinc-800 bg-zinc-900/50">
          <div className="p-3 text-[11px] font-mono text-zinc-600 border-r border-zinc-800/80">
            TIME
          </div>
          {DAYS.map((d) => (
            <div
              key={d}
              className="p-3 text-center border-r border-zinc-800/80 last:border-r-0"
            >
              <span className="text-xs font-semibold text-zinc-400">{d}</span>
            </div>
          ))}
        </div>

        {/* Mobile Day Strip Skeleton */}
        <div className="sm:hidden grid grid-cols-5 gap-1 p-2 border-b border-zinc-800 bg-zinc-900/60">
          {DAYS.map((d, i) => (
            <div
              key={d}
              className={`py-1.5 text-center rounded text-xs font-semibold ${
                i === 0 ? 'bg-zinc-800 text-zinc-200' : 'text-zinc-500'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Timeline Grid Skeleton */}
        <div className="grid grid-cols-[52px_1fr] sm:grid-cols-[52px_repeat(5,1fr)]">
          <div className="border-r border-zinc-800/80 bg-zinc-950/60">
            {HOURS.map((h) => (
              <div
                key={h}
                className="h-16 text-[10px] sm:text-[11px] font-mono text-zinc-600 px-1.5 pt-1 border-b border-zinc-900"
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Column 1 (shown on all screen sizes) */}
          <div className="relative border-r border-zinc-800/80 p-1 space-y-4">
            <div className="mt-8 h-20 rounded-md skeleton-shimmer border border-zinc-800/60" />
            <div className="mt-12 h-24 rounded-md skeleton-shimmer border border-zinc-800/60" />
          </div>

          {/* Columns 2-5 (hidden on mobile, shown on desktop) */}
          <div className="hidden sm:block relative border-r border-zinc-800/80 p-1 space-y-4">
            <div className="mt-24 h-24 rounded-md skeleton-shimmer border border-zinc-800/60" />
          </div>

          <div className="hidden sm:block relative border-r border-zinc-800/80 p-1 space-y-4">
            <div className="mt-8 h-20 rounded-md skeleton-shimmer border border-zinc-800/60" />
            <div className="mt-12 h-24 rounded-md skeleton-shimmer border border-zinc-800/60" />
          </div>

          <div className="hidden sm:block relative border-r border-zinc-800/80 p-1 space-y-4">
            <div className="mt-24 h-24 rounded-md skeleton-shimmer border border-zinc-800/60" />
            <div className="mt-4 h-16 rounded-md skeleton-shimmer border border-zinc-800/60" />
          </div>

          <div className="hidden sm:block relative p-1 space-y-4">
            <div className="mt-36 h-28 rounded-md skeleton-shimmer border border-zinc-800/60" />
          </div>
        </div>
      </div>
    </div>
  );
};
