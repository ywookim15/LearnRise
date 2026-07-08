// MOCK DATA — streak counter + calendar history.

export interface StreakDay {
  label: string; // "M", "T", ...
  date: number; // day of month
  active: boolean;
  isToday?: boolean;
}

export const currentStreak = 14;

/** The compact 7-day strip shown next to the dashboard heading. */
export const weekStreak: StreakDay[] = [
  { label: "M", date: 6, active: true },
  { label: "T", date: 7, active: true },
  { label: "W", date: 8, active: true, isToday: true },
  { label: "T", date: 9, active: false },
  { label: "F", date: 10, active: false },
  { label: "S", date: 11, active: false },
  { label: "S", date: 12, active: false },
];

export interface CalendarMonth {
  name: string;
  /** null = padding for the leading weekday offset */
  days: (boolean | null)[];
}

/** Mock calendar-view history for the streak popup. */
export const streakCalendar: CalendarMonth[] = [
  {
    name: "June 2026",
    days: [
      null, null, null, null, null, false, true,
      true, true, false, true, true, true, true,
      true, false, true, true, true, true, true,
      true, true, true, false, true, true, true,
      true, true,
    ],
  },
  {
    name: "July 2026",
    days: [
      null, null, false, true, true, true, true,
      true, true, false, false, false, false, false,
    ],
  },
];

export const streakStats = {
  current: 14,
  longest: 28,
  totalDays: 96,
  thisMonth: 8,
};
