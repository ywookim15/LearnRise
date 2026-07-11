"use client";

import type { ReactNode } from "react";
import { NotificationsDropdown } from "@/components/shared/notifications-dropdown";
import { ProfileDropdown } from "@/components/shared/profile-dropdown";

export function Topbar({ left }: { left?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="min-w-0 flex-1">{left}</div>
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        <ProfileDropdown />
      </div>
    </header>
  );
}
