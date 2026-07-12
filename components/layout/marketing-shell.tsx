import type { ReactNode } from "react";
import Link from "next/link";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Logo } from "@/components/shared/logo";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}

function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm text-muted-foreground">
            METIS is your learning GPS — precise, adaptive roadmaps that turn any
            goal into a resourced path.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <Link href="/about" className="text-muted-foreground hover:text-foreground">About</Link>
          <Link href="/pricing" className="text-muted-foreground hover:text-foreground">Pricing</Link>
          <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact</Link>
          <Link href="/login" className="text-muted-foreground hover:text-foreground">Sign In</Link>
        </nav>
      </div>
      <div className="border-t border-border py-5">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} METIS. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
