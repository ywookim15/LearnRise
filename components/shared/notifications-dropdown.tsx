"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

export function NotificationsDropdown() {
  const { notifications, unreadCount, markAllRead } = useApp();
  const recent = notifications.slice(0, 5);

  return (
    <Popover>
      <PopoverTrigger
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[22rem] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-primary hover:underline"
          >
            Mark all read
          </button>
        </div>
        <div className="max-h-[20rem] divide-y divide-border overflow-y-auto scrollbar-slim">
          {recent.map((n) => (
            <div key={n.id} className="flex gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  n.unread ? "bg-secondary" : "bg-transparent"
                )}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium leading-snug">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">{n.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-2">
          <Link
            href="/notifications"
            className="flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-muted"
          >
            See more
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
