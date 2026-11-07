'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Plus,
  Download,
  Upload,
  Clock,
  MapPin,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Palette,
  Copy,
  Check,
  ChevronDown,
  FileImage,
  FileText,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { ClassSession, WeekDay } from '@/types/schedule';
import { getThemeById, COLOR_THEMES } from '@/lib/theme-palette';
import { exportAsImage, exportAsPDF, exportAsICS } from '@/lib/export-utils';
import { ClassInspector } from './ClassInspector';

interface ScheduleGridProps {
  initialClasses: ClassSession[];
  onReset: () => void;
}

const WEEKDAYS: { key: WeekDay; label: string; full: string }[] = [
  { key: 'MON', label: 'Mon', full: 'Monday' },
  { key: 'TUE', label: 'Tue', full: 'Tuesday' },
  { key: 'WED', label: 'Wed', full: 'Wednesday' },
  { key: 'THU', label: 'Thu', full: 'Thursday' },
  { key: 'FRI', label: 'Fri', full: 'Friday' },
];

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const HOUR_HEIGHT = 64; // px per hour
const START_HOUR = 7;

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({
  initialClasses,
  onReset,
}) => {
  const [classes, setClasses] = useState<ClassSession[]>(initialClasses);
  const [activeView, setActiveView] = useState<'week' | 'day' | 'agenda'>('day');
  const [activeDay, setActiveDay] = useState<WeekDay>('MON');
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilterCode, setActiveFilterCode] = useState<string | null>(null);
  const [currentTimeOffset, setCurrentTimeOffset] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  // Responsive default: 'day' on small screens, 'week' on desktop
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      setActiveView('week');
    }
  }, []);

  // Close export dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(e.target as Node)
      ) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live time scrubber calculation
  useEffect(() => {
    const updateScrubber = () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      if (currentH >= START_HOUR && currentH <= 18) {
        const top = ((currentH - START_HOUR) * 60 + currentM) * (HOUR_HEIGHT / 60);
        setCurrentTimeOffset(top);
      } else {
        setCurrentTimeOffset(null);
      }
    };

    updateScrubber();
    const interval = setInterval(updateScrubber, 60000);
    return () => clearInterval(interval);
  }, []);

  const distinctCourses = useMemo(() => {
    return Array.from(new Set(classes.map((c) => c.courseCode)));
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        c.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        activeFilterCode === null || c.courseCode === activeFilterCode;

      return matchesSearch && matchesFilter;
    });
  }, [classes, searchQuery, activeFilterCode]);

  const dayLoads = useMemo(() => {
    return WEEKDAYS.map((day) => {
      const dayClasses = classes.filter((c) => c.day === day.key);
      let mins = 0;
      dayClasses.forEach((c) => {
        const [sh, sm] = c.startTime.split(':').map(Number);
        const [eh, em] = c.endTime.split(':').map(Number);
        mins += eh * 60 + em - (sh * 60 + sm);
      });
      return {
        ...day,
        hours: (mins / 60).toFixed(1),
        count: dayClasses.length,
      };
    });
  }, [classes]);

  const calculatePosition = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startMinutes = (startH - START_HOUR) * 60 + startM;
    const durationMinutes = (endH - startH) * 60 + (endM - startM);

    const top = (startMinutes / 60) * HOUR_HEIGHT;
    const height = Math.max((durationMinutes / 60) * HOUR_HEIGHT, 34);

    return { top, height };
  };

  const handleEdit = (c: ClassSession) => {
    setSelectedClass(c);
    setIsInspectorOpen(true);
  };

  const handleSave = (updated: ClassSession) => {
    setClasses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDelete = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCycleTheme = (e: React.MouseEvent, c: ClassSession) => {
    e.stopPropagation();
    const currIdx = COLOR_THEMES.findIndex((t) => t.id === c.colorThemeId);
    const nextTheme = COLOR_THEMES[(currIdx + 1) % COLOR_THEMES.length];
    setClasses((prev) =>
      prev.map((item) =>
        item.id === c.id ? { ...item, colorThemeId: nextTheme.id } : item
      )
    );
  };

  const handleCopyRoom = (e: React.MouseEvent, c: ClassSession) => {
    e.stopPropagation();
    if (c.room) {
      navigator.clipboard.writeText(c.room);
      setCopiedId(c.id);
      setTimeout(() => setCopiedId(null), 1500);
    }
  };

  const handleSlotClick = (dayKey: WeekDay, hour: number) => {
    const startStr = `${String(hour).padStart(2, '0')}:00`;
    const endStr = `${String(Math.min(hour + 1, 20)).padStart(2, '0')}:30`;

    const newSession: ClassSession = {
      id: `cls-${Date.now()}`,
      courseCode: 'NEW 101',
      courseName: 'New Class Session',
      room: 'Room 101',
      instructor: 'Staff',
      day: dayKey,
      startTime: startStr,
      endTime: endStr,
      colorThemeId: 'indigo',
    };
    setClasses((prev) => [...prev, newSession]);
    setSelectedClass(newSession);
    setIsInspectorOpen(true);
  };

  // Export handlers
  const handleExport = async (format: 'png' | 'jpg' | 'pdf' | 'ics') => {
    setIsExportOpen(false);

    try {
      if (format === 'png') {
        await exportAsImage(classes, 'png');
        setExportFeedback('PNG saved');
      } else if (format === 'jpg') {
        await exportAsImage(classes, 'jpeg');
        setExportFeedback('JPG saved');
      } else if (format === 'pdf') {
        exportAsPDF();
        setExportFeedback('PDF print dialog');
      } else if (format === 'ics') {
        exportAsICS(classes);
        setExportFeedback('iCal saved');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to export schedule.');
    }

    setTimeout(() => setExportFeedback(null), 2500);
  };

  return (
    <div className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-6 space-y-4 pb-12 sm:pb-6 print-area">
      {/* Mobile-First Header & Toolbar */}
      <div className="flex flex-col gap-3 pb-3 border-b border-zinc-800 no-print">
        {/* Row 1: View Segmented Control + Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* View Switcher Tabs */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950/80 p-0.5 text-xs font-medium">
            <button
              onClick={() => setActiveView('day')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeView === 'day'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setActiveView('week')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeView === 'week'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setActiveView('agenda')}
              className={`px-3 py-1.5 rounded-md transition cursor-pointer ${
                activeView === 'agenda'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Agenda
            </button>
          </div>

          {/* Action Buttons with Export Dropdown */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => handleSlotClick(activeDay, 10)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700/60 transition active:scale-95 cursor-pointer shadow-sm"
              title="Add a new class"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-300" />
              <span className="hidden sm:inline">Add Class</span>
            </button>

            {/* EXPORT DROPDOWN MENU */}
            <div className="relative" ref={exportDropdownRef}>
              <button
                type="button"
                onClick={() => setIsExportOpen(!isExportOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition active:scale-95 cursor-pointer shadow-sm ${
                  exportFeedback
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-100 hover:bg-white text-zinc-900'
                }`}
                title="Export schedule options"
              >
                {exportFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{exportFeedback}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                    <ChevronDown
                      className={`w-3 h-3 text-zinc-600 transition-transform ${
                        isExportOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </>
                )}
              </button>

              {/* Dropdown Popover */}
              {isExportOpen && (
                <div className="absolute right-0 mt-1.5 w-48 rounded-xl border border-zinc-800 bg-zinc-900/95 p-1.5 shadow-2xl backdrop-blur-xl z-50 divide-y divide-zinc-800/60 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="pb-1">
                    <button
                      type="button"
                      onClick={() => handleExport('png')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                    >
                      <FileImage className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-medium">PNG Image (.png)</div>
                        <div className="text-[10px] text-zinc-500">
                          Lossless 2x HD Image
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExport('jpg')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                    >
                      <FileImage className="w-4 h-4 text-indigo-400" />
                      <div>
                        <div className="font-medium">JPEG Image (.jpg)</div>
                        <div className="text-[10px] text-zinc-500">
                          Standard photo file
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExport('pdf')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-rose-400" />
                      <div>
                        <div className="font-medium">PDF Document (.pdf)</div>
                        <div className="text-[10px] text-zinc-500">
                          Vector printable PDF
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleExport('ics')}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                    >
                      <CalendarIcon className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="font-medium">Calendar (.ics)</div>
                        <div className="text-[10px] text-zinc-500">
                          Sync Apple & Google
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 text-xs transition cursor-pointer"
              title="Import another timetable"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Re-import</span>
            </button>
          </div>
        </div>

        {/* Row 2: Search Input */}
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search class, room number, professor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition"
          />
        </div>

        {/* Row 3: Mobile Day Strip (Mon-Fri selector with class counts) */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {dayLoads.map((d) => {
            const isSelected = activeDay === d.key;
            return (
              <button
                key={d.key}
                onClick={() => {
                  setActiveDay(d.key);
                  if (activeView === 'week' && typeof window !== 'undefined' && window.innerWidth < 768) {
                    setActiveView('day');
                  }
                }}
                className={`flex flex-col items-center py-2 px-1 rounded-lg border transition cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-800 border-zinc-600 text-zinc-100 shadow-sm'
                    : 'bg-zinc-950/60 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-zinc-300'
                }`}
              >
                <span className="text-xs font-bold">{d.label}</span>
                <span className="text-[10px] font-mono mt-0.5 text-zinc-500">
                  {d.count > 0 ? `${d.count} cls` : 'Free'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 4: Subject Filter Chips */}
        {distinctCourses.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1 mr-1 shrink-0">
              <Filter className="w-3 h-3 text-zinc-600" />
              <span>Filter:</span>
            </span>

            <button
              onClick={() => setActiveFilterCode(null)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition shrink-0 cursor-pointer ${
                activeFilterCode === null
                  ? 'bg-zinc-200 text-zinc-900 font-semibold'
                  : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({classes.length})
            </button>

            {distinctCourses.map((code) => {
              const count = classes.filter((c) => c.courseCode === code).length;
              const isSelected = activeFilterCode === code;
              return (
                <button
                  key={code}
                  onClick={() => setActiveFilterCode(isSelected ? null : code)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  {code} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW: Mobile-Optimized Day View */}
      {activeView === 'day' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-900/60 no-print">
            <button
              onClick={() => {
                const idx = WEEKDAYS.findIndex((d) => d.key === activeDay);
                if (idx > 0) setActiveDay(WEEKDAYS[idx - 1].key);
              }}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <span className="text-xs font-bold text-zinc-100">
                {WEEKDAYS.find((d) => d.key === activeDay)?.full} Schedule
              </span>
              <span className="block text-[10px] text-zinc-500 font-mono">
                {filteredClasses.filter((c) => c.day === activeDay).length} classes scheduled
              </span>
            </div>

            <button
              onClick={() => {
                const idx = WEEKDAYS.findIndex((d) => d.key === activeDay);
                if (idx < WEEKDAYS.length - 1) setActiveDay(WEEKDAYS[idx + 1].key);
              }}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative grid grid-cols-[52px_1fr] overflow-hidden">
            {currentTimeOffset !== null && (
              <div
                style={{ top: `${currentTimeOffset}px` }}
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center no-print"
              >
                <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] -ml-1" />
                <div className="w-full h-[1.5px] bg-rose-500/80" />
              </div>
            )}

            <div className="border-r border-zinc-800/80 select-none bg-zinc-950/80">
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="relative text-[10px] sm:text-[11px] font-mono text-zinc-400 px-1.5 sm:px-2 pt-1 border-b border-zinc-900"
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            <div
              className="relative bg-transparent"
              style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
            >
              {HOURS.map((h) => (
                <div
                  key={h}
                  onClick={() => handleSlotClick(activeDay, h)}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="border-b border-zinc-900/70 hover:bg-zinc-800/20 transition-colors cursor-cell relative group/slot"
                  title={`Tap to add class at ${h}:00`}
                >
                  <span className="opacity-0 group-hover/slot:opacity-100 absolute top-1 right-2 text-xs text-zinc-600 font-mono no-print">
                    + tap to add
                  </span>
                </div>
              ))}

              {filteredClasses
                .filter((c) => c.day === activeDay)
                .map((c) => {
                  const theme = getThemeById(c.colorThemeId);
                  const { top, height } = calculatePosition(
                    c.startTime,
                    c.endTime
                  );

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleEdit(c)}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      className={`absolute left-1.5 right-1.5 rounded-lg border p-2.5 overflow-hidden transition-all duration-150 cursor-pointer ${theme.bg} ${theme.border} hover:scale-[1.005] hover:brightness-125 z-10 active:scale-[0.99]`}
                    >
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accent}`}
                      />

                      <div className="pl-1.5 flex flex-col justify-between h-full">
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-zinc-100">
                              {c.courseCode}
                            </span>
                            <span className="text-[11px] text-zinc-400 font-mono">
                              {c.startTime} – {c.endTime}
                            </span>
                          </div>

                          <div className="text-xs text-zinc-300 font-medium truncate mt-0.5">
                            {c.courseName}
                          </div>
                        </div>

                        {height >= 50 && (
                          <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1">
                            {c.room && (
                              <span className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-zinc-500" />
                                {c.room}
                              </span>
                            )}
                            {c.instructor && (
                              <span className="flex items-center gap-1 truncate opacity-75">
                                <User className="w-3 h-3 text-zinc-500" />
                                {c.instructor}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Desktop / Tablet Week Matrix */}
      {activeView === 'week' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-md overflow-hidden shadow-2xl">
          <div className="grid grid-cols-[52px_repeat(5,1fr)] border-b border-zinc-800 bg-zinc-900/60 min-w-[580px]">
            <div className="p-3 text-[10px] sm:text-[11px] font-mono text-zinc-500 border-r border-zinc-800/80">
              TIME
            </div>
            {WEEKDAYS.map((day) => {
              const dayCount = filteredClasses.filter((c) => c.day === day.key).length;
              return (
                <div
                  key={day.key}
                  className="p-3 text-center border-r border-zinc-800/80 last:border-r-0"
                >
                  <div className="text-xs font-semibold text-zinc-200">
                    {day.label}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                    {dayCount} {dayCount === 1 ? 'class' : 'classes'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative grid grid-cols-[52px_repeat(5,1fr)] overflow-x-auto min-w-[580px]">
            {currentTimeOffset !== null && (
              <div
                style={{ top: `${currentTimeOffset}px` }}
                className="absolute left-0 right-0 z-20 pointer-events-none flex items-center no-print"
              >
                <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] -ml-1" />
                <div className="w-full h-[1.5px] bg-rose-500/80" />
              </div>
            )}

            <div className="border-r border-zinc-800/80 select-none bg-zinc-950/80">
              {HOURS.map((h) => (
                <div
                  key={h}
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  className="relative text-[10px] sm:text-[11px] font-mono text-zinc-400 px-1.5 sm:px-2 pt-1 border-b border-zinc-900"
                >
                  {String(h).padStart(2, '0')}:00
                </div>
              ))}
            </div>

            {WEEKDAYS.map((day) => {
              const dayClasses = filteredClasses.filter((c) => c.day === day.key);
              return (
                <div
                  key={day.key}
                  className="relative border-r border-zinc-800/80 last:border-r-0 bg-transparent"
                  style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
                >
                  {HOURS.map((h) => (
                    <div
                      key={h}
                      onClick={() => handleSlotClick(day.key, h)}
                      style={{ height: `${HOUR_HEIGHT}px` }}
                      className="border-b border-zinc-900/70 hover:bg-zinc-800/20 transition-colors cursor-cell group/slot relative"
                      title={`Click to add class on ${day.full} at ${h}:00`}
                    >
                      <span className="opacity-0 group-hover/slot:opacity-100 absolute top-1 right-1 text-[10px] text-zinc-600 font-mono pointer-events-none no-print">
                        +
                      </span>
                    </div>
                  ))}

                  {dayClasses.map((c) => {
                    const theme = getThemeById(c.colorThemeId);
                    const { top, height } = calculatePosition(
                      c.startTime,
                      c.endTime
                    );

                    return (
                      <div
                        key={c.id}
                        onClick={() => handleEdit(c)}
                        style={{ top: `${top}px`, height: `${height}px` }}
                        className={`absolute left-1 right-1 rounded-md border p-2 overflow-hidden transition-all duration-150 cursor-pointer ${theme.bg} ${theme.border} hover:scale-[1.01] hover:brightness-125 hover:shadow-lg z-10 active:scale-[0.99] group/card`}
                      >
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${theme.accent}`}
                        />

                        <div className="pl-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-bold tracking-tight text-zinc-100 truncate">
                              {c.courseCode}
                            </span>

                            <div className="opacity-0 group-hover/card:opacity-100 flex items-center gap-1 transition-opacity no-print">
                              <button
                                type="button"
                                onClick={(e) => handleCycleTheme(e, c)}
                                className="p-0.5 rounded bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                title="Change color tag"
                              >
                                <Palette className="w-2.5 h-2.5" />
                              </button>
                              {c.room && (
                                <button
                                  type="button"
                                  onClick={(e) => handleCopyRoom(e, c)}
                                  className="p-0.5 rounded bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                  title="Copy room"
                                >
                                  {copiedId === c.id ? (
                                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-2.5 h-2.5" />
                                  )}
                                </button>
                              )}
                            </div>

                            <span className="text-[10px] text-zinc-400 font-mono shrink-0 group-hover/card:hidden">
                              {c.startTime}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-300 font-medium truncate mt-0.5">
                            {c.courseName}
                          </div>

                          {height >= 56 && (
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-zinc-400 truncate">
                              {c.room && (
                                <span className="truncate">{c.room}</span>
                              )}
                              {c.instructor && (
                                <span className="truncate opacity-75">
                                  {c.instructor}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: Agenda List View */}
      {activeView === 'agenda' && (
        <div className="space-y-4">
          {WEEKDAYS.map((day) => {
            const dayClasses = filteredClasses
              .filter((c) => c.day === day.key)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={day.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 uppercase tracking-wider px-1">
                  <span>{day.full}</span>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                  </span>
                </div>

                {dayClasses.length === 0 ? (
                  <div className="p-3 text-xs text-zinc-600 border border-dashed border-zinc-800 rounded-lg text-center">
                    Free day
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800/80 rounded-xl border border-zinc-800 bg-zinc-950/70 backdrop-blur-md">
                    {dayClasses.map((c) => {
                      const theme = getThemeById(c.colorThemeId);
                      return (
                        <div
                          key={c.id}
                          onClick={() => handleEdit(c)}
                          className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-zinc-900/60 cursor-pointer transition active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-8 w-1 rounded-full ${theme.accent}`} />
                            <div>
                              <div className="text-xs font-semibold text-zinc-100">
                                {c.courseCode} — {c.courseName}
                              </div>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-zinc-400 mt-0.5">
                                <span className="font-mono text-zinc-300">
                                  {c.startTime} - {c.endTime}
                                </span>
                                {c.room && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-zinc-500" />
                                    {c.room}
                                  </span>
                                )}
                                {c.instructor && (
                                  <span className="flex items-center gap-1 opacity-80">
                                    <User className="w-3 h-3 text-zinc-500" />
                                    {c.instructor}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-zinc-500 shrink-0 no-print">
                            Edit →
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Adaptive Sheet: Mobile Bottom Sheet + Desktop Side Drawer */}
      <ClassInspector
        session={selectedClass}
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};
