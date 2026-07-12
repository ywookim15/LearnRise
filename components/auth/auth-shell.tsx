import type { ReactNode } from "react";
import Link from "next/link";
import { Compass, Route, Sparkles } from "lucide-react";
import { Logo } from "@/components/shared/logo";

/**
 * Two-pane auth frame: a brand gradient panel (hidden on small screens) and a
 * centered form column. Shared by Login / Sign Up / Forgot Password.
 */
export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-brand-gradient lg:block">
        <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -left-10 bottom-10 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="w-fit rounded-xl bg-white/95 px-3 py-2">
            <Logo />
          </Link>
          <div>
            <h2 className="max-w-sm font-serif text-4xl leading-tight text-white">
              Your learning, precisely mapped.
            </h2>
            <p className="mt-4 max-w-sm text-white/80">
              Set a destination and METIS plots the route — resourced, ordered,
              and adaptive.
            </p>
            <ul className="mt-10 space-y-4">
              {[
                { icon: Compass, text: "Never wonder what to study next" },
                { icon: Route, text: "Roadmaps sequenced just for you" },
                { icon: Sparkles, text: "An AI tutor that knows your path" },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.text} className="flex items-center gap-3 text-white/90">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                      <Icon className="h-4 w-4" />
                    </span>
                    {f.text}
                  </li>
                );
              })}
            </ul>
          </div>
          <p className="text-xs text-white/60">© {new Date().getFullYear()} METIS</p>
        </div>
      </div>

      {/* Form column */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link href="/">
              <Logo />
            </Link>
          </div>
          <h1 className="font-serif text-3xl tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
