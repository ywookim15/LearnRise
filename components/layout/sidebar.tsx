"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LayoutGrid, Archive, FolderClosed, Settings, Crown } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useApp } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", key: "dashboard", icon: LayoutGrid, matchPrefixes: ["/dashboard", "/journey"] },
  { href: "/archive", key: "archive", icon: Archive, matchPrefixes: ["/archive"] },
  { href: "/resources", key: "resources", icon: FolderClosed, matchPrefixes: ["/resources"] },
] as const;

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const t = useTranslations("app.sidebar");
  const { isPremium } = useApp();

  return (
    <aside className={cn("flex h-full w-64 shrink-0 flex-col border-r border-border bg-card", className)}>
      <div className="px-5 py-6">
        <Link href="/dashboard" aria-label="Go to dashboard" onClick={onNavigate}>
          <Logo tagline />
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
          {t("menu")}
        </p>
        {NAV.map((item) => {
          const active = item.matchPrefixes.some((p) => pathname.startsWith(p));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-brand-gradient text-white shadow-brand"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 px-3 pb-5">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={cn(
            "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            pathname.startsWith("/settings")
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Settings className="h-[18px] w-[18px]" aria-hidden="true" />
          {t("settings")}
        </Link>

        {isPremium && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-accent p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
              <Crown className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{t("proPlan")}</p>
              <p className="text-xs text-muted-foreground">{t("proMember")}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
