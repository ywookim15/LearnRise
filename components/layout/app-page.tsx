"use client";

import type { ReactNode } from "react";
import { Topbar } from "@/components/layout/topbar";
import { cn } from "@/lib/utils";

/**
 * Standard logged-in page frame: sticky Topbar + a scrollable main region.
 * `noContainer` lets special pages (e.g. the Journey page's split view) take
 * over the full content area without the default padding / max-width.
 */
export function AppPage({
  children,
  topbarLeft,
  showMemoryAgent = true,
  noContainer = false,
  contentClassName,
}: {
  children: ReactNode;
  topbarLeft?: ReactNode;
  showMemoryAgent?: boolean;
  noContainer?: boolean;
  contentClassName?: string;
}) {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden">
      <Topbar left={topbarLeft} showMemoryAgent={showMemoryAgent} />
      <main className="flex-1 overflow-y-auto scrollbar-slim">
        {noContainer ? (
          children
        ) : (
          <div className={cn("mx-auto w-full max-w-6xl px-6 py-8 lg:px-10", contentClassName)}>
            {children}
          </div>
        )}
      </main>
    </div>
  );
}
