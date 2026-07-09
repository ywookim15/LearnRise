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

export const mockNotifications: AppNotification[] = [];
