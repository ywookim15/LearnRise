"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, LineChart, Archive, FolderClosed, Settings, Crown } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, matchPrefixes: ["/dashboard", "/journey"] },
  { href: "/analytics", label: "Analytics", icon: LineChart, matchPrefixes: ["/analytics"] },
  { href: "/archive", label: "Archive", icon: Archive, matchPrefixes: ["/archive"] },
  { href: "/resources", label: "Resources", icon: FolderClosed, matchPrefixes: ["/resources"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isPremium } = useApp();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-border bg-card">
      <div className="px-5 py-6">
        <Link href="/dashboard" aria-label="Go to dashboard">
          <Logo tagline />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
          Menu
        </p>
        {NAV.map((item) => {
          const active = item.matchPrefixes.some((p) => pathname.startsWith(p));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-brand-gradient text-white shadow-brand"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-3 pb-5">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Settings
        </Link>

        {isPremium ? (
          <div className="flex items-center gap-3 rounded-2xl border border-primary/20 bg-brand-gradient-soft p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand">
              <Crown className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Pro Plan</p>
              <p className="text-xs text-muted-foreground">You&apos;re a Pro member</p>
            </div>
          </div>
        ) : (
          <Link
            href="/upgrade"
            className="block overflow-hidden rounded-2xl bg-brand-gradient p-4 shadow-brand transition-transform hover:scale-[1.01]"
          >
            <p className="text-sm font-semibold text-white">Upgrade Plan</p>
            <p className="mt-1 text-xs leading-snug text-white/80">
              Unlock adaptive tutor &amp; multi-journey memory sync.
            </p>
            <span className="mt-3 flex items-center justify-center rounded-lg bg-white/95 px-3 py-2 text-sm font-semibold text-primary">
              Upgrade
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
}
