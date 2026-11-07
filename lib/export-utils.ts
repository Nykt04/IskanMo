import { ClassSession } from '@/types/schedule';
import { getThemeById } from './theme-palette';

const WEEKDAYS = [
  { key: 'MON', label: 'Monday' },
  { key: 'TUE', label: 'Tuesday' },
  { key: 'WED', label: 'Wednesday' },
  { key: 'THU', label: 'Thursday' },
  { key: 'FRI', label: 'Friday' },
];

const START_HOUR = 8;
const END_HOUR = 18;
const TOTAL_HOURS = END_HOUR - START_HOUR;

/**
 * High-DPI Canvas generator for PNG and JPG exports
 */
export async function exportAsImage(
  classes: ClassSession[],
  format: 'png' | 'jpeg'
): Promise<void> {
  const width = 1400;
  const height = 900;
  const padding = 40;
  const timeGutterWidth = 80;
  const headerHeight = 70;

  const canvas = document.createElement('canvas');
  canvas.width = width * 2; // 2x Retina DPI
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, width, height);

  // Title & Header bar
  ctx.fillStyle = '#f4f4f5';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('IskanMo Timetable', padding, padding + 10);

  ctx.fillStyle = '#71717a';
  ctx.font = '12px monospace';
  ctx.fillText(
    `${classes.length} classes enrolled • Generated with IskanMo`,
    padding,
    padding + 28
  );

  const gridLeft = padding + timeGutterWidth;
  const gridTop = padding + headerHeight;
  const gridWidth = width - gridLeft - padding;
  const gridHeight = height - gridTop - padding;
  const colWidth = gridWidth / 5;
  const hourHeight = gridHeight / TOTAL_HOURS;

  // Day Headers
  WEEKDAYS.forEach((day, index) => {
    const colX = gridLeft + index * colWidth;
    ctx.fillStyle = '#18181b';
    ctx.fillRect(colX, gridTop - 30, colWidth, 30);

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.strokeRect(colX, gridTop - 30, colWidth, 30);

    ctx.fillStyle = '#e4e4e7';
    ctx.font = 'bold 12px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(day.label, colX + colWidth / 2, gridTop - 11);
  });

  // Time labels and horizontal lines
  ctx.textAlign = 'left';
  for (let h = START_HOUR; h <= END_HOUR; h++) {
    const y = gridTop + (h - START_HOUR) * hourHeight;

    // Time Label
    ctx.fillStyle = '#71717a';
    ctx.font = '11px monospace';
    ctx.fillText(`${String(h).padStart(2, '0')}:00`, padding, y + 4);

    // Grid line
    ctx.strokeStyle = '#1e1e24';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gridLeft, y);
    ctx.lineTo(gridLeft + gridWidth, y);
    ctx.stroke();
  }

  // Column vertical lines
  for (let i = 0; i <= 5; i++) {
    const x = gridLeft + i * colWidth;
    ctx.strokeStyle = '#1e1e24';
    ctx.beginPath();
    ctx.moveTo(x, gridTop);
    ctx.lineTo(x, gridTop + gridHeight);
    ctx.stroke();
  }

  // Color mappings for canvas
  const themeColors: Record<string, { bg: string; border: string; accent: string; text: string }> = {
    indigo: { bg: '#1e1b4b', border: '#4338ca', accent: '#6366f1', text: '#e0e7ff' },
    cyan: { bg: '#083344', border: '#0891b2', accent: '#06b6d4', text: '#cffafe' },
    emerald: { bg: '#064e3b', border: '#059669', accent: '#10b981', text: '#d1fae5' },
    amber: { bg: '#451a03', border: '#d97706', accent: '#f59e0b', text: '#fef3c7' },
    rose: { bg: '#4c0519', border: '#e11d48', accent: '#f43f5e', text: '#ffe4e6' },
    zinc: { bg: '#18181b', border: '#3f3f46', accent: '#a1a1aa', text: '#f4f4f5' },
  };

  // Draw Classes
  classes.forEach((c) => {
    const dayIndex = WEEKDAYS.findIndex((d) => d.key === c.day);
    if (dayIndex === -1) return;

    const [sh, sm] = c.startTime.split(':').map(Number);
    const [eh, em] = c.endTime.split(':').map(Number);

    const startMins = (sh - START_HOUR) * 60 + sm;
    const durMins = (eh - sh) * 60 + (em - sm);

    const blockX = gridLeft + dayIndex * colWidth + 4;
    const blockY = gridTop + (startMins / 60) * hourHeight;
    const blockW = colWidth - 8;
    const blockH = Math.max((durMins / 60) * hourHeight, 32);

    const colors = themeColors[c.colorThemeId] || themeColors.indigo;

    // Card background
    ctx.fillStyle = colors.bg;
    ctx.beginPath();
    ctx.roundRect(blockX, blockY, blockW, blockH, 6);
    ctx.fill();

    // Card border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left accent strip
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.roundRect(blockX, blockY, 4, blockH, [6, 0, 0, 6]);
    ctx.fill();

    // Card content text
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 11px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(c.courseCode, blockX + 10, blockY + 16);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '10px -apple-system, sans-serif';
    const cleanName = c.courseName.length > 20 ? c.courseName.slice(0, 18) + '...' : c.courseName;
    ctx.fillText(cleanName, blockX + 10, blockY + 30);

    if (blockH >= 52) {
      ctx.fillStyle = '#71717a';
      ctx.font = '9px monospace';
      ctx.fillText(`${c.startTime}-${c.endTime} • ${c.room || 'TBA'}`, blockX + 10, blockY + 44);
    }
  });

  // Export file
  const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
  const dataUrl = canvas.toDataURL(mimeType, 0.95);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `schedule.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * PDF Export via native high-resolution print stylesheet
 */
export function exportAsPDF(): void {
  window.print();
}

/**
 * iCal (.ics) Calendar File export
 */
export function exportAsICS(classes: ClassSession[]): void {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//IskanMo//Timetable//EN',
    'CALSCALE:GREGORIAN',
  ];

  classes.forEach((c) => {
    lines.push(
      'BEGIN:VEVENT',
      `SUMMARY:${c.courseCode} - ${c.courseName}`,
      `LOCATION:${c.room || ''}`,
      `DESCRIPTION:${c.instructor || ''}`,
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schedule.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
