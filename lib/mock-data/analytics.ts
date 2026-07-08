// MOCK DATA — analytics dashboard numbers and chart series.

export const analyticsSummary = [
  { label: "Study time this week", value: "6h 40m", delta: "+18%", positive: true },
  { label: "Resources completed", value: "23", delta: "+5", positive: true },
  { label: "Current streak", value: "14 days", delta: "Personal best: 28", positive: true },
  { label: "Active journeys", value: "3", delta: "1 nearly done", positive: true },
];

/** Minutes studied per day for the last 7 days (for the bar chart). */
export const weeklyStudyMinutes = [
  { day: "Mon", minutes: 55 },
  { day: "Tue", minutes: 80 },
  { day: "Wed", minutes: 40 },
  { day: "Thu", minutes: 95 },
  { day: "Fri", minutes: 65 },
  { day: "Sat", minutes: 30 },
  { day: "Sun", minutes: 35 },
];

/** Subject breakdown for the donut/segment chart. */
export const subjectBreakdown = [
  { subject: "Systems Architecture", share: 46, color: "#6366F1" },
  { subject: "Cognitive Psychology", share: 34, color: "#A855F7" },
  { subject: "Design Systems 2.0", share: 20, color: "#0F172A" },
];

/** 12-week streak history sparkline data (0–7 active days per week). */
export const streakHistory = [3, 4, 5, 7, 6, 7, 7, 5, 6, 7, 7, 7];
