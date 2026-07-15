"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Logo } from "@/components/shared/logo";
import { useApp } from "@/lib/context/app-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations("app.shell");
  const { isLoggedIn, authReady } = useApp();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  // Middleware already blocks these routes server-side; this client guard is
  // the UX layer that reacts to in-tab auth changes (e.g. sign-out).
  useEffect(() => {
    if (authReady && !isLoggedIn) router.replace("/login");
  }, [authReady, isLoggedIn, router]);

  if (!authReady || !isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        {t("loadingSession")}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-secondary/50"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar onNavigate={() => setNavOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:hidden">
          <button
            type="button"
            onClick={() => setNavOpen(true)}
            aria-label={t("openMenu")}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link href="/dashboard" aria-label={t("goToDashboard")}>
            <Logo />
          </Link>
        </div>

        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
