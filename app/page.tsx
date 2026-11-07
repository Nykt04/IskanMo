'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Smartphone, RefreshCw } from 'lucide-react';
import { SplashScreen } from '@/components/SplashScreen';
import { InteractiveParticles } from '@/components/InteractiveParticles';
import { CursorSpotlight } from '@/components/CursorSpotlight';
import { CameraDropzone } from '@/components/CameraDropzone';
import { ProcessingScreen } from '@/components/ProcessingScreen';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { ClassSession, ParseScheduleResponse } from '@/types/schedule';

type AppState = 'idle' | 'processing' | 'viewing';

export default function IskanMoApp() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [splashKey, setSplashKey] = useState(0);

  // Upload feedback & error tracking
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleProcessImage = async (file: File) => {
    if (uploadedPreviewUrl) {
      URL.revokeObjectURL(uploadedPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setUploadedPreviewUrl(previewUrl);
    setUploadedFileName(file.name);
    setLastUploadedFile(file);
    setProcessingError(null);
    setAppState('processing');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/parse-schedule', {
        method: 'POST',
        body: formData,
      });

      const json: ParseScheduleResponse = await res.json();

      if (json.success && json.data) {
        setClasses(json.data.classes);
        setAppState('viewing');
      } else {
        setProcessingError(json.error || 'Unable to parse timetable from image.');
      }
    } catch (err: any) {
      console.error('[UPLOAD_ERROR]', err);
      setProcessingError(
        err?.message || 'Network error communicating with timetable parser.'
      );
    }
  };

  const handleUseSampleDemo = async () => {
    setProcessingError(null);
    setAppState('processing');
    try {
      const formData = new FormData();
      formData.append('isDemo', 'true');

      const res = await fetch('/api/parse-schedule', {
        method: 'POST',
        body: formData,
      });

      const json: ParseScheduleResponse = await res.json();
      if (json.success && json.data) {
        setClasses(json.data.classes);
        setAppState('viewing');
      } else {
        setProcessingError(json.error || 'Failed to load sample schedule.');
      }
    } catch (e: any) {
      console.error(e);
      setProcessingError('Network connection error while fetching demo schedule.');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-[#09090b] text-zinc-100 overflow-x-hidden selection:bg-indigo-500/20 selection:text-indigo-200">
      {/* 1. Ambient Dynamic Cursor Spotlight */}
      <CursorSpotlight />

      {/* 2. Interactive Floating Particle Network (Mouse/Touch Reactive) */}
      <InteractiveParticles />

      {/* 3. Framer Motion Splash Screen */}
      <SplashScreen key={splashKey} durationMs={2000} />

      {/* 4. Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            onClick={() => {
              setAppState('idle');
              setProcessingError(null);
            }}
          >
            <div className="h-7 w-7 rounded-md bg-zinc-800 border border-zinc-700/80 flex items-center justify-center text-zinc-200 group-hover:border-zinc-500 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.3)] transition">
              <Calendar className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-zinc-100 group-hover:text-white transition">
              IskanMo
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Replay Intro Splash */}
            <button
              type="button"
              onClick={() => setSplashKey((k) => k + 1)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 text-xs transition cursor-pointer"
              title="Replay animated loading screen"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Replay Intro</span>
            </button>

            {/* PWA Install Button */}
            {installPrompt && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium border border-zinc-700 transition active:scale-95 cursor-pointer shadow-sm"
              >
                <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                <span>Install</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono text-zinc-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>PWA Ready</span>
            </div>
          </div>
        </div>
      </header>

      {/* 5. Main Interactive Surface */}
      <main className="relative z-10 flex-1 py-8 sm:py-10 flex flex-col justify-center">
        {appState === 'idle' && (
          <CameraDropzone
            onProcessImage={handleProcessImage}
            onUseSampleDemo={handleUseSampleDemo}
          />
        )}

        {appState === 'processing' && (
          <ProcessingScreen
            error={processingError}
            previewUrl={uploadedPreviewUrl}
            fileName={uploadedFileName}
            onCancel={() => {
              setAppState('idle');
              setProcessingError(null);
            }}
            onRetry={() => {
              if (lastUploadedFile) {
                handleProcessImage(lastUploadedFile);
              }
            }}
            onUseDemo={handleUseSampleDemo}
          />
        )}

        {appState === 'viewing' && (
          <ScheduleGrid
            initialClasses={classes}
            onReset={() => {
              setAppState('idle');
              setProcessingError(null);
            }}
          />
        )}
      </main>

      {/* 6. Footer */}
      <footer className="relative z-10 border-t border-zinc-900 py-3 text-center text-[11px] text-zinc-500 font-mono">
        <span>IskanMo • Interactive Timetable Engine</span>
      </footer>
    </div>
  );
}
