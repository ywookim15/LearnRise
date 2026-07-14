import { normalizeLanguage } from "@/lib/i18n/languages";

export const LOCALE_COOKIE = "metis_locale";

/**
 * Persist the chosen UI locale in a cookie the server reads (see
 * i18n/request.ts). One year, lax, site-wide. Call `router.refresh()` after
 * this to re-render server components in the new locale.
 */
export function setLocaleCookie(code: string): void {
  if (typeof document === "undefined") return;
  const locale = normalizeLanguage(code);
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}
