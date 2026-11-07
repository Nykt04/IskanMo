'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onFinish?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 2000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onFinish?.();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [durationMs, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: 'blur(10px)',
          }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090b] select-none"
        >
          {/* Subtle Ambient Backlight */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0.15 }}
            transition={{ duration: 1.6, ease: 'easeOut' }}
            className="absolute h-72 w-72 rounded-full bg-indigo-500 blur-3xl pointer-events-none"
          />

          <div className="relative flex flex-col items-center">
            {/* Linear-grade Animated Monogram Mark */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 shadow-2xl backdrop-blur-xl"
            >
              <svg
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
              >
                {/* Calendar Outer Frame */}
                <motion.rect
                  x="8"
                  y="12"
                  width="48"
                  height="44"
                  rx="10"
                  stroke="#f4f4f5"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                />

                {/* Horizontal Header Divider */}
                <motion.line
                  x1="8"
                  y1="24"
                  x2="56"
                  y2="24"
                  stroke="#3f3f46"
                  strokeWidth="2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                />

                {/* Top Binder Rings */}
                <motion.line
                  x1="20"
                  y1="6"
                  x2="20"
                  y2="13"
                  stroke="#a1a1aa"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ y1: 10, y2: 10, opacity: 0 }}
                  animate={{ y1: 6, y2: 13, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                />
                <motion.line
                  x1="44"
                  y1="6"
                  x2="44"
                  y2="13"
                  stroke="#a1a1aa"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ y1: 10, y2: 10, opacity: 0 }}
                  animate={{ y1: 6, y2: 13, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.45 }}
                />

                {/* Timetable Session Rectangles Pop-in */}
                <motion.rect
                  x="16"
                  y="31"
                  width="13"
                  height="7"
                  rx="2.5"
                  fill="#6366f1"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7, type: 'spring', stiffness: 350 }}
                />
                <motion.rect
                  x="35"
                  y="31"
                  width="13"
                  height="16"
                  rx="2.5"
                  fill="#06b6d4"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.85, type: 'spring', stiffness: 350 }}
                />
                <motion.rect
                  x="16"
                  y="42"
                  width="13"
                  height="7"
                  rx="2.5"
                  fill="#10b981"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1.0, type: 'spring', stiffness: 350 }}
                />
              </svg>
            </motion.div>

            {/* Typography Stagger */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              className="mt-5 flex flex-col items-center"
            >
              <h1 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-1.5">
                <span>IskanMo</span>
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </h1>
              <p className="mt-1 text-[11px] text-zinc-400 font-mono tracking-widest uppercase">
                Timetable Architect
              </p>
            </motion.div>

            {/* Precision Micro-Loader Bar */}
            <motion.div
              className="mt-6 h-[2px] w-28 overflow-hidden rounded-full bg-zinc-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  repeat: Infinity,
                  duration: 1.2,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
