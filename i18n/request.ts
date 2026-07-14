import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { normalizeLanguage } from "@/lib/i18n/languages";

// The UI locale is preference-driven (not URL-prefixed): it comes from the
// `metis_locale` cookie, which the language picker sets (mirroring the user's
// learning language). Falls back to English for anyone without the cookie.
export const LOCALE_COOKIE = "metis_locale";

export default getRequestConfig(async () => {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = normalizeLanguage(cookieLocale);
  return {
    locale,
    // English is the master catalog; every other locale ships the same keys,
    // so a missing key can only happen mid-development. Fall back to English
    // messages for resilience in production.
    messages: {
      ...(await import("../messages/en.json")).default,
      ...(await import(`../messages/${locale}.json`)).default,
    },
  };
});
