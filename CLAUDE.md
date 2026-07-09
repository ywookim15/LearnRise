# METIS — Working Agreement & Project Notes

METIS is an AI-powered adaptive learning-roadmap product ("your learning GPS")
for high school and college students. Next.js (App Router) + React + Tailwind +
shadcn/ui on the frontend; Supabase (auth + Postgres) and Gemini/Tavily on the
backend.

## Standing workflow — commit & deploy automatically

**Commit and push to `main` automatically after completing each meaningful unit
of work** (a completed step, a bug fix, a feature). Do not wait to be asked each
time.

**Vercel auto-deploys from `main` — pushing to `main` is equivalent to deploying
to production.** Treat every push to `main` as a production release: only push
work that builds cleanly and you've verified.

**Write clear, specific commit messages describing what changed and why** — not
just "update" or "fix". Prefer a short summary line plus bullet points for
non-trivial changes.

Practical guardrails that follow from the above:
- Run `npm run build` (it type-checks) before pushing to `main`; never push a
  red build to production.
- Keep secrets out of commits. `.env.local` is gitignored and must never be
  committed; only `.env.example` (placeholder keys) belongs in git.
- For large or risky changes, it's still fine to use a branch + review first —
  but the default for finished, verified work is: commit → push `main` → live.

## Architecture quick reference

- **Auth**: real Supabase email/password. `middleware.ts` guards logged-in
  routes; SSR clients in `lib/supabase/` (`client` browser, `server` cookie,
  `admin` service-role — server-only).
- **Journey pipeline** (`lib/server/`): `planner` (Stage 2 roadmap), `curator`
  (Stage 3 resources), `chief` (Stage 6 chat adaptation), `memory` (Stage 5),
  with `gemini`/`tavily`/`youtube` clients. Every Gemini call uses **function
  calling** (structured output) with pacing + 429-aware retries.
- **API routes**: `POST /api/journeys` (create), `POST /api/journeys/[id]/curate`
  (re-curate), `POST /api/journeys/[id]/chat` (Ask METIS).
- **Background work** must use `runInBackground()` (`lib/server/background.ts`),
  which uses Vercel `waitUntil` so async work survives past the HTTP response on
  serverless. Never use bare `void promise` for post-response work in a route.
- **Data layer**: `lib/data/journeys.ts` + `useJourneyDetail` hook feed the
  Dashboard / Journey / Unit pages from Supabase (RLS-scoped).

## Environment variables

Client-safe (browser): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
Server-only (never `NEXT_PUBLIC_`): `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`
(and `METIS_GEMINI_API_KEY` to override a conflicting shell var), `TAVILY_API_KEY`,
optional `YOUTUBE_API_KEY`. See `.env.example`. Set the same vars in the Vercel
project settings for production.

## Known constraints

- Gemini free tier (~20 req/min + a daily cap) throttles curation/replan; a paid
  tier is recommended for real usage. Rate-limit handling already backs off and
  retries, and curation is resumable via the curate re-trigger route.
