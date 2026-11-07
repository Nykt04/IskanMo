'use client';

import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, MapPin, User, Calendar } from 'lucide-react';
import { ClassSession, WeekDay } from '@/types/schedule';
import { COLOR_THEMES } from '@/lib/theme-palette';

interface ClassInspectorProps {
  session: ClassSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: ClassSession) => void;
  onDelete: (id: string) => void;
}

export const ClassInspector: React.FC<ClassInspectorProps> = ({
  session,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<ClassSession | null>(session);

  useEffect(() => {
    setFormData(session);
  }, [session]);

  if (!isOpen || !formData) return null;

  const handleChange = (field: keyof ClassSession, value: string) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-stretch sm:justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Sheet: Mobile Bottom Sheet (<sm) & Desktop Side Drawer (>=sm) */}
      <div className="relative w-full sm:max-w-sm max-h-[90vh] sm:max-h-full sm:h-full bg-zinc-900 border-t sm:border-t-0 sm:border-l border-zinc-800 rounded-t-2xl sm:rounded-none p-5 sm:p-6 flex flex-col justify-between z-10 shadow-2xl overflow-hidden pb-8 sm:pb-6">
        {/* Mobile Pull Handle Indicator */}
        <div className="sm:hidden w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-3" />

        <div className="space-y-5 overflow-y-auto pr-1">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Class Details
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Edit schedule, location and color tag
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              aria-label="Close sheet"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form id="inspector-form" onSubmit={handleSave} className="space-y-4">
            {/* Color Tag Picker */}
            <div>
              <label className="text-[11px] font-medium text-zinc-400 block mb-2">
                Color Tag
              </label>
              <div className="flex items-center gap-2.5">
                {COLOR_THEMES.map((theme) => {
                  const isSelected = formData.colorThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => handleChange('colorThemeId', theme.id)}
                      className={`h-7 w-7 rounded-full ${theme.accent} transition-transform cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110'
                          : 'opacity-50 hover:opacity-100'
                      }`}
                      title={theme.name}
                    />
                  );
                })}
              </div>
            </div>

            {/* Course Code & Name */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={formData.courseCode}
                  onChange={(e) => handleChange('courseCode', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono focus:border-zinc-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                  Course Name
                </label>
                <input
                  type="text"
                  value={formData.courseName}
                  onChange={(e) => handleChange('courseName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Day & Time */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mb-1">
                  <Calendar className="w-3 h-3 text-zinc-500" />
                  <span>Day</span>
                </label>
                <select
                  value={formData.day}
                  onChange={(e) => handleChange('day', e.target.value as WeekDay)}
                  className="w-full px-2 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none font-mono"
                >
                  <option value="MON">Mon</option>
                  <option value="TUE">Tue</option>
                  <option value="WED">Wed</option>
                  <option value="THU">Thu</option>
                  <option value="FRI">Fri</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>Start</span>
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleChange('startTime', e.target.value)}
                  className="w-full px-2 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono focus:border-zinc-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>End</span>
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleChange('endTime', e.target.value)}
                  className="w-full px-2 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 font-mono focus:border-zinc-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* Room & Professor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mb-1">
                  <MapPin className="w-3 h-3 text-zinc-500" />
                  <span>Room / Building</span>
                </label>
                <input
                  type="text"
                  value={formData.room}
                  onChange={(e) => handleChange('room', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
                  placeholder="e.g. Hall 402"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-zinc-400 flex items-center gap-1 mb-1">
                  <User className="w-3 h-3 text-zinc-500" />
                  <span>Instructor</span>
                </label>
                <input
                  type="text"
                  value={formData.instructor}
                  onChange={(e) => handleChange('instructor', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:border-zinc-500 focus:outline-none"
                  placeholder="e.g. Dr. Vance"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions with mobile thumb-friendly heights */}
        <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-3 mt-4">
          <button
            type="button"
            onClick={() => {
              onDelete(formData.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="inspector-form"
              className="px-5 py-2 rounded-lg text-xs font-medium bg-zinc-100 hover:bg-white text-zinc-900 transition shadow-sm"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
