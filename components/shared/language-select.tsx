"use client";

import { Globe } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n/languages";
import { cn } from "@/lib/utils";

/**
 * Native <select> language picker (works reliably everywhere, including mobile,
 * with no extra dependency). Shows the endonym so speakers recognize their
 * language, with the English name in parentheses.
 */
export function LanguageSelect({
  value,
  onChange,
  id,
  disabled,
  className,
}: {
  value: string;
  onChange: (code: string) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <Globe
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-11 w-full appearance-none rounded-lg border border-input bg-card pl-9 pr-9 text-sm text-foreground shadow-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.nativeName}
            {l.nativeName !== l.englishName ? ` (${l.englishName})` : ""}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      >
        ▾
      </span>
    </div>
  );
}
