"use client";

import { Bell, Flame, Sparkles, TrendingUp, BookOpen, Settings2 } from "lucide-react";
import { StandaloneShell } from "@/components/layout/standalone-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/app-context";
import type { NotificationType } from "@/lib/mock-data/notifications";
import { cn } from "@/lib/utils";

const ICON: Record<NotificationType, typeof Bell> = {
  streak: Flame,
  nudge: Sparkles,
  milestone: TrendingUp,
  resource: BookOpen,
  system: Settings2,
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAllRead } = useApp();

  return (
    <StandaloneShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl tracking-tight">My Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
            <Bell className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium">No notifications yet</p>
            <p className="text-xs text-muted-foreground">
              Streak reminders and journey nudges will show up here.
            </p>
          </div>
        )}
        {notifications.map((n) => {
          const Icon = ICON[n.type];
          return (
            <div
              key={n.id}
              className={cn(
                "flex gap-4 rounded-2xl border bg-card p-4 shadow-card transition-colors",
                n.unread ? "border-primary/30" : "border-border"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  n.unread ? "bg-brand-gradient text-white" : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold leading-snug">{n.title}</p>
                  {n.unread && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-secondary" />}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1.5 text-xs text-muted-foreground/70">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </StandaloneShell>
  );
}
