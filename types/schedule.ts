export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI';

export interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  room: string;
  instructor: string;
  day: WeekDay;
  startTime: string; // '09:00' (24h format)
  endTime: string;   // '10:30' (24h format)
  colorThemeId: string;
}

export interface ColorTheme {
  id: string;
  name: string;
  cardBg: string;
  cardBorder: string;
  badgeBg: string;
  badgeText: string;
  indicator: string;
  glow: string;
}

export interface ParseScheduleResponse {
  success: boolean;
  data?: {
    classes: ClassSession[];
    summary: {
      totalCourses: number;
      totalCreditsEstimate: number;
      earliestTime: string;
      latestTime: string;
    };
  };
  error?: string;
}
