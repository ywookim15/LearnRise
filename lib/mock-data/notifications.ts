// MOCK DATA — notifications feed. No real push/email in this phase.

export type NotificationType = "streak" | "nudge" | "milestone" | "resource" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string; // human-readable "sent" label
  unread: boolean;
}

export const mockNotifications: AppNotification[] = [
  {
    id: "n1",
    type: "streak",
    title: "🔥 12-day streak on Cognitive Psychology!",
    body: "You're on a roll. Keep it alive with today's chapter on decision-making.",
    time: "Today · 9:02 AM",
    unread: true,
  },
  {
    id: "n2",
    type: "nudge",
    title: "Keep your Systems Architecture journey going",
    body: "It's been a day since your last session. One resource is all it takes.",
    time: "Today · 7:30 AM",
    unread: true,
  },
  {
    id: "n3",
    type: "milestone",
    title: "You crossed 65% on Systems Architecture",
    body: "Two units down. The consensus unit is where it gets really interesting.",
    time: "Yesterday · 8:45 PM",
    unread: true,
  },
  {
    id: "n4",
    type: "resource",
    title: "New recommended resource added",
    body: "“Visualizing Raft” was added to your Data Consistency unit.",
    time: "Yesterday · 2:10 PM",
    unread: false,
  },
  {
    id: "n5",
    type: "streak",
    title: "Streak reminder",
    body: "Study before midnight to extend your 4-day Systems Architecture streak.",
    time: "Yesterday · 11:00 AM",
    unread: false,
  },
  {
    id: "n6",
    type: "system",
    title: "Welcome to METIS Pro",
    body: "Adaptive tutoring and multi-journey memory sync are now unlocked.",
    time: "2 days ago · 4:22 PM",
    unread: false,
  },
  {
    id: "n7",
    type: "nudge",
    title: "Design Systems 2.0 is waiting",
    body: "You started this journey but haven't checked off a resource yet.",
    time: "3 days ago · 6:15 PM",
    unread: false,
  },
];
