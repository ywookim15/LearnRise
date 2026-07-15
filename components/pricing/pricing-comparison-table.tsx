import { Fragment } from "react";
import { Check, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Each row references translation keys (row{n}Feature/Free/Pro under
// pricingPage.compare). Boolean rows render a check/x from explicit flags
// rather than comparing a translated string, so localization can't break the
// icon logic.
interface Row {
  n: number;
  boolean?: boolean;
  freeIncluded?: boolean;
  proIncluded?: boolean;
  center?: boolean;
}

const ROWS: Row[] = [
  { n: 1 },
  { n: 2, boolean: true, freeIncluded: true, proIncluded: true },
  { n: 3 },
  { n: 4 },
  { n: 5, center: true },
  { n: 6, boolean: true, freeIncluded: false, proIncluded: true },
  { n: 7, boolean: true, freeIncluded: false, proIncluded: true },
  { n: 8 },
];

export function PricingComparisonTable() {
  const t = useTranslations("pricingPage.compare");

  function BoolCell({ included }: { included: boolean }) {
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
        <span className={cn("text-sm", !included && "text-muted-foreground")}>
          {included ? t("included") : t("notIncluded")}
        </span>
      </span>
    );
  }

  function TextCell({ value, pro, center }: { value: string; pro?: boolean; center?: boolean }) {
    return (
      <span
        className={cn(
          "text-sm",
          center && "block text-center",
          pro ? "font-semibold text-foreground" : "text-muted-foreground"
        )}
      >
        {value}
      </span>
    );
  }

  return (
    <div className="mx-auto mt-16 max-w-4xl">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-serif text-2xl tracking-tight text-foreground sm:text-3xl">{t("title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Desktop / tablet table */}
      <div className="mt-8 hidden overflow-hidden rounded-3xl border border-border bg-card shadow-card md:block">
        <div className="grid grid-cols-[1.4fr_1fr_1fr]">
          <div className="border-b border-border p-5" />
          <div className="border-b border-border p-5 text-center">
            <p className="text-sm font-semibold">{t("free")}</p>
          </div>
          <div className="relative border-b border-l border-primary/30 bg-primary/5 p-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm font-semibold text-primary">{t("pro")}</p>
              <Badge variant="gradient">{t("recommended")}</Badge>
            </div>
          </div>

          {ROWS.map((row, i) => (
            <Fragment key={row.n}>
              <div className={cn("flex items-center p-5 text-sm font-medium", i < ROWS.length - 1 && "border-b border-border")}>
                {t(`row${row.n}Feature`)}
              </div>
              <div className={cn("flex items-center justify-center p-5", i < ROWS.length - 1 && "border-b border-border")}>
                {row.boolean ? (
                  <BoolCell included={!!row.freeIncluded} />
                ) : (
                  <TextCell value={t(`row${row.n}Free`)} center={row.center} />
                )}
              </div>
              <div className={cn("flex items-center justify-center border-l border-primary/30 bg-primary/5 p-5", i < ROWS.length - 1 && "border-b border-primary/30")}>
                {row.boolean ? (
                  <BoolCell included={!!row.proIncluded} />
                ) : (
                  <TextCell value={t(`row${row.n}Pro`)} pro center={row.center} />
                )}
              </div>
            </Fragment>
          ))}
        </div>
      </div>

      {/* Mobile: one card per feature, no horizontal scrolling */}
      <div className="mt-8 space-y-3 md:hidden">
        {ROWS.map((row) => (
          <div key={row.n} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <p className="text-sm font-semibold">{t(`row${row.n}Feature`)}</p>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t("free")}</p>
                <div className="mt-1.5">
                  {row.boolean ? <BoolCell included={!!row.freeIncluded} /> : <TextCell value={t(`row${row.n}Free`)} center={row.center} />}
                </div>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">{t("pro")}</p>
                <div className="mt-1.5">
                  {row.boolean ? <BoolCell included={!!row.proIncluded} /> : <TextCell value={t(`row${row.n}Pro`)} pro center={row.center} />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
