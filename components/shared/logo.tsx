import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * METIS mark — the exact provided logo artwork (triangle + breakthrough arrow),
 * with its white background knocked out to transparent so it sits on any light
 * surface. Source: /public/logo-mark.png.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt="METIS"
      width={581}
      height={604}
      className={cn("h-8 w-auto", className)}
    />
  );
}

/**
 * Horizontal lockup: the real mark + METIS wordmark. `tagline` adds the
 * "LEARNING GPS" kicker used in the app sidebar.
 */
export function Logo({
  className,
  tagline = false,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="h-9 w-auto" />
      <span className="flex flex-col leading-none">
        <span className="text-lg font-bold tracking-[0.14em] text-primary">METIS</span>
        {tagline && (
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Learning GPS
          </span>
        )}
      </span>
    </span>
  );
}
