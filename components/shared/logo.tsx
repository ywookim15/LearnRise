import { cn } from "@/lib/utils";

/**
 * Text-only wordmark. `tagline` adds the "LEARNING GPS" kicker used in the
 * app sidebar.
 */
export function Logo({
  className,
  tagline = false,
}: {
  className?: string;
  tagline?: boolean;
}) {
  return (
    <span className={cn("flex flex-col leading-none", className)}>
      <span className="text-lg font-bold tracking-[0.14em] text-primary">LearnRise</span>
      {tagline && (
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Learning GPS
        </span>
      )}
    </span>
  );
}
