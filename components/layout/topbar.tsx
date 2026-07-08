"use client";

import type { ReactNode } from "react";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { ProfileDropdown } from "@/components/shared/profile-dropdown";

export function Topbar({
  left,
  showMemoryAgent = true,
}: {
  left?: ReactNode;
  showMemoryAgent?: boolean;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="min-w-0 flex-1">{left}</div>
      <div className="flex items-center gap-2">
        {showMemoryAgent && (
          <span className="mr-1 hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Memory Agent: Active
          </span>
        )}
        <NotificationsDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}
