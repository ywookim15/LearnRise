import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Wraps blocked content: blurs it out (still visible in shape, unreadable and
 * unclickable) and overlays a big bold "Pro plan" message with an upgrade CTA.
 * Renders children unmodified when `active` is false.
 *
 * `className`/`contentClassName` let a nested flex layout (e.g. the chat
 * panel) keep its sizing instead of collapsing once it's no longer a direct
 * flex child of its original parent.
 */
export function ProGate({
  active,
  title,
  subtitle,
  children,
  className,
  contentClassName,
}: {
  active: boolean;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const t = useTranslations("app.proGate");
  if (!active) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <div aria-hidden className={cn("pointer-events-none select-none blur-md", contentClassName)}>
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl bg-background/70 p-6 text-center backdrop-blur-[1px]">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
          <Lock className="h-5 w-5" />
        </span>
        <p className="text-2xl font-extrabold uppercase tracking-wide text-primary">
          {title}
        </p>
        {subtitle && <p className="max-w-xs text-sm text-muted-foreground">{subtitle}</p>}
        <Button asChild variant="gradient" className="mt-1">
          <Link href="/upgrade">{t("upgradeToPro")}</Link>
        </Button>
      </div>
    </div>
  );
}
