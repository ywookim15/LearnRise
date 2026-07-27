import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupportedLanguage } from "@/lib/i18n/languages";

// Cookie that drives the interface locale (preference-based, no URL prefix).
// Kept in sync with lib/i18n/set-locale.ts + i18n/request.ts.
const LOCALE_COOKIE = "metis_locale";
const ONE_YEAR = 60 * 60 * 24 * 365;

// Server-side auth guard + session refresh. Replaces the Phase 1 mock guard as
// the real enforcement layer (the client-side checks are UX only).

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/archive",
  "/resources",
  "/upgrade",
  "/journey",
  "/notifications",
  "/settings",
];

// Pages a signed-in user shouldn't see (bounce to dashboard instead).
const AUTH_PAGES = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Revalidates the JWT against Supabase Auth (not just the local cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );
  const isAuthPage = AUTH_PAGES.some((p) => path === p);

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // Cross-device locale sync: a signed-in user's saved learning language is the
  // source of truth for their interface locale. On a device/browser that has no
  // locale cookie yet (e.g. first login on a new device), adopt the language
  // they chose on their profile so their preference follows them everywhere.
  // We only fill an ABSENT cookie so we never fight an explicit choice made on
  // this device (the settings/signup pickers set the cookie directly).
  if (user && !request.cookies.get(LOCALE_COOKIE)) {
    const savedLang = (user.user_metadata as Record<string, unknown> | undefined)
      ?.learning_language;
    if (typeof savedLang === "string" && isSupportedLanguage(savedLang)) {
      // Preserve any auth cookies Supabase refreshed onto the response, then
      // rebuild it so THIS render already forwards the locale cookie in-request.
      const refreshed = response.cookies.getAll();
      request.cookies.set(LOCALE_COOKIE, savedLang);
      response = NextResponse.next({ request });
      for (const c of refreshed) response.cookies.set(c);
      response.cookies.set(LOCALE_COOKIE, savedLang, {
        path: "/",
        maxAge: ONE_YEAR,
        sameSite: "lax",
      });
    }
  }

  return response;
}

export const config = {
  // Skip static assets; run everywhere else so sessions stay refreshed.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
