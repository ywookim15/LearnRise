"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  const t = useTranslations("nav");

  return (
    <header className="glass sticky top-0 z-50 border-b border-border/70">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" aria-label="LearnRise home">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">{t("signIn")}</Link>
          </Button>
          <Button asChild size="sm" variant="gradient" className="rounded-full px-6">
            <Link href="/signup">{t("getStarted")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
