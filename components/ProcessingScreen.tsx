'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';

interface ProcessingScreenProps {
  onCancel?: () => void;
  onRetry?: () => void;
  onUseDemo?: () => void;
  error?: string | null;
  previewUrl?: string | null;
  fileName?: string | null;
}

const STAGES = [
  { threshold: 0, note: 'Reading and preprocessing timetable image...' },
  { threshold: 25, note: 'Detecting text rows, course codes, and meeting days...' },
  { threshold: 55, note: 'Extracting class hours, room numbers, and instructors...' },
  { threshold: 80, note: 'Resolving schedule matrix and color themes...' },
  { threshold: 95, note: 'Finalizing interactive weekly calendar...' },
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  onCancel,
  onRetry,
  onUseDemo,
  error,
  previewUrl,
  fileName,
}) => {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (error) return;

    // Asymptotic progress curve: climbs to 95% while awaiting backend response
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return 95;
        const step = prev < 40 ? 5 : prev < 75 ? 3 : 1;
        return Math.min(prev + step, 95);
      });
    }, 120);

    return () => clearInterval(interval);
  }, [error]);

  const currentStage =
    [...STAGES].reverse().find((s) => progress >= s.threshold) || STAGES[0];

  return (
    <div className="w-full max-w-md mx-auto px-4 py-8 animate-in fade-in zoom-in-95 duration-200">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/85 p-6 sm:p-7 backdrop-blur-xl shadow-2xl space-y-5 text-center">
        {/* Optional Image Thumbnail with Laser Sweep */}
        {previewUrl && (
          <div className="relative mx-auto w-32 h-20 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Schedule upload"
              className="w-full h-full object-cover opacity-80"
            />
            {!error && (
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#06b6d4] animate-laser pointer-events-none" />
            )}
          </div>
        )}

        {/* Status Icon */}
        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-inner">
          {error ? (
            <AlertCircle className="w-7 h-7 text-rose-500" />
          ) : progress >= 100 ? (
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          ) : (
            <>
              <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 animate-ping opacity-30" />
              <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
            </>
          )}
        </div>

        {/* Progress Value & Title */}
        <div className="space-y-1">
          <div className="text-3xl font-bold font-mono tracking-tight text-white">
            {error ? 'Upload Issue' : `${progress}%`}
          </div>
          <p className="text-xs font-medium text-zinc-300">
            {error ? 'Could Not Process Timetable' : 'Scanning & Converting Timetable'}
          </p>
          {fileName && (
            <p className="text-[11px] font-mono text-zinc-500 truncate max-w-xs mx-auto">
              {fileName}
            </p>
          )}
        </div>

        {/* 0-100% Progress Bar */}
        <div className="space-y-2">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full transition-all duration-200 ease-out ${
                error
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400'
              }`}
              style={{ width: `${error ? 100 : progress}%` }}
            />
          </div>

          {/* Dynamic Stage Note */}
          <p className="text-xs text-zinc-400 font-mono min-h-[1.75rem] flex items-center justify-center px-2">
            {error ? error : currentStage.note}
          </p>
        </div>

        {/* 4 Stage Stepper */}
        {!error && (
          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-zinc-800/80 text-[10px] font-mono">
            <div
              className={`p-1 rounded text-center transition ${
                progress >= 25
                  ? 'text-indigo-300 bg-indigo-950/30'
                  : 'text-zinc-600 bg-zinc-950/40'
              }`}
            >
              1. Image
            </div>
            <div
              className={`p-1 rounded text-center transition ${
                progress >= 55
                  ? 'text-indigo-300 bg-indigo-950/30'
                  : 'text-zinc-600 bg-zinc-950/40'
              }`}
            >
              2. OCR
            </div>
            <div
              className={`p-1 rounded text-center transition ${
                progress >= 80
                  ? 'text-indigo-300 bg-indigo-950/30'
                  : 'text-zinc-600 bg-zinc-950/40'
              }`}
            >
              3. Classes
            </div>
            <div
              className={`p-1 rounded text-center transition ${
                progress >= 95
                  ? 'text-indigo-300 bg-indigo-950/30'
                  : 'text-zinc-600 bg-zinc-950/40'
              }`}
            >
              4. Ready
            </div>
          </div>
        )}

        {/* Actions when error occurs */}
        {error ? (
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Processing</span>
              </button>
            )}

            {onUseDemo && (
              <button
                type="button"
                onClick={onUseDemo}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>View Sample Schedule Instead</span>
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
              >
                Return to Uploader
              </button>
            )}
          </div>
        ) : (
          onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-300 transition cursor-pointer"
            >
              Cancel Processing
            </button>
          )
        )}
      </div>
    </div>
  );
};
