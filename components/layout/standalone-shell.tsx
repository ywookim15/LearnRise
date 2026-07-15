"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/app-context";

/**
 * Sidebar-less page frame with a back button, used by the Notifications and
 * Profile/Settings pages. Mock-auth guarded like the main app shell.
 */
export function StandaloneShell({
  children,
  backHref = "/dashboard",
  backLabel,
}: {
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  const t = useTranslations("app.shell");
  const { isLoggedIn, authReady } = useApp();
  const router = useRouter();

  // Middleware enforces auth server-side; this reacts to in-tab sign-out.
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-6">
          <Button asChild variant="ghost" size="sm">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4" />
              {backLabel ?? t("backToDashboard")}
            </Link>
          </Button>
          <Logo />
        </div>
      </header>
      <div className="mx-auto w-full max-w-3xl px-6 py-8">{children}</div>
    </div>
  );
}
