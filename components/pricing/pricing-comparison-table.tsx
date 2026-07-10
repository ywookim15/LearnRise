import { Fragment } from "react";
import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ComparisonRow {
  feature: string;
  free: string;
  pro: string;
  /** "Included"/"Not included" rows get a check/x icon instead of plain text. */
  boolean?: boolean;
}

const ROWS: ComparisonRow[] = [
  { feature: "Active learning journeys", free: "1", pro: "Unlimited" },
  { feature: "AI-generated roadmap & resources", free: "Included", pro: "Included", boolean: true },
  { feature: "Chat with METIS", free: "Limited messages/day", pro: "Unlimited" },
  { feature: "Adaptive re-routing when you struggle", free: "Limited (3/month)", pro: "Unlimited" },
  { feature: "Reasoning quality & roadmap depth", free: "Standard", pro: "Enhanced — richer, more detailed roadmaps" },
  { feature: "Analytics & progress insights", free: "Not included", pro: "Included", boolean: true },
  { feature: "Priority support", free: "Not included", pro: "Included", boolean: true },
  { feature: "Free trial", free: "—", pro: "7 days free" },
];

function Cell({ value, boolean, pro }: { value: string; boolean?: boolean; pro?: boolean }) {
  if (boolean) {
    const included = value === "Included";
    return (
      <span className="flex items-center gap-2">
        <span
          className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            included ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
          )}
        >
          {included ? <Check className="h-3 w-3" strokeWidth={3} /> : <X className="h-3 w-3" strokeWidth={3} />}
        </span>
        <span className={cn("text-sm", !included && "text-muted-foreground")}>{value}</span>
      </span>
    );
  }
  return (
    <span className={cn("text-sm", pro ? "font-semibold text-foreground" : "text-muted-foreground")}>
      {value}
    </span>
  );
}

/** Feature-by-feature Free vs. Pro comparison. Desktop: a 3-column table with
 * the Pro column visually emphasized. Mobile: one card per feature so nothing
 * has to scroll horizontally. */
export function PricingComparisonTable() {
  return (
    <div className="mx-auto mt-16 max-w-4xl">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">
          Compare plans
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything included at a glance.
        </p>
      </div>

      {/* Desktop / tablet table */}
      <div className="mt-8 hidden overflow-hidden rounded-3xl border border-border bg-card shadow-card md:block">
        <div className="grid grid-cols-[1.4fr_1fr_1fr]">
          <div className="border-b border-border p-5" />
          <div className="border-b border-border p-5 text-center">
            <p className="text-sm font-semibold">Free</p>
          </div>
          <div className="relative border-b border-l border-primary/30 bg-primary/5 p-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm font-semibold text-primary">Pro</p>
              <Badge variant="gradient">Recommended</Badge>
            </div>
          </div>

          {ROWS.map((row, i) => (
            <Fragment key={row.feature}>
              <div
                className={cn(
                  "flex items-center p-5 text-sm font-medium",
                  i < ROWS.length - 1 && "border-b border-border"
                )}
              >
                {row.feature}
              </div>
              <div
                className={cn(
                  "flex items-center justify-center p-5",
                  i < ROWS.length - 1 && "border-b border-border"
                )}
              >
                <Cell value={row.free} boolean={row.boolean} />
              </div>
              <div
                className={cn(
                  "flex items-center justify-center border-l border-primary/30 bg-primary/5 p-5",
                  i < ROWS.length - 1 && "border-b border-primary/30"
                )}
              >
                <Cell value={row.pro} boolean={row.boolean} pro />
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Mobile: one card per feature, no horizontal scrolling */}
      <div className="mt-8 space-y-3 md:hidden">
        {ROWS.map((row) => (
          <div
            key={row.feature}
            className="rounded-2xl border border-border bg-card p-4 shadow-card"
          >
            <p className="text-sm font-semibold">{row.feature}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Free
                </p>
                <div className="mt-1.5">
                  <Cell value={row.free} boolean={row.boolean} />
                </div>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Pro
                </p>
                <div className="mt-1.5">
                  <Cell value={row.pro} boolean={row.boolean} pro />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
