# METIS

METIS — an AI-powered adaptive learning roadmap ("your learning GPS") for high school and college students.

## Status

**Phase 1 — frontend-only prototype (mock data).** This repository contains a fully
clickable, navigable frontend shell. There is **no backend, no database, no real
authentication, and no real AI integration** yet. All data is hardcoded/mock and all
state lives in React memory only. Backend and AI work is planned for Phase 2 (see
[Roadmap](#roadmap)).

## Tech stack

- **Next.js** (App Router) + **React**
- **Tailwind CSS** — design tokens (colors, fonts, radii, shadows) extracted into
  `tailwind.config.ts` and CSS variables in `app/globals.css`
- **shadcn/ui-style primitives** (Radix UI under the hood), restyled to the METIS
  design system, in `components/ui/`
- **TypeScript**

## Folder structure

```
app/                      # Next.js App Router pages
  layout.tsx              # Root layout: fonts + global mock-state provider
  globals.css             # Tailwind layers + design-token CSS variables
  page.tsx                # Public landing page
  about/ pricing/ contact/    # Public marketing pages
  login/ signup/ forgot-password/   # Auth shell pages (UI only)
  notifications/ settings/    # Standalone pages (back button, no sidebar)
  (app)/                  # Logged-in route group (persistent sidebar + top bar)
    layout.tsx            # Sidebar shell + mock auth guard
    dashboard/            # "My Learning Journeys" home
    analytics/            # Mock charts and stats
    archive/              # Completed + deleted journeys
    resources/            # Saved resources hub
    upgrade/              # Logged-in pricing / upgrade page
    journey/[id]/         # Individual journey (roadmap + Ask METIS panel)
    journey/[id]/unit/[unitId]/   # Unit drill-in (flowchart + chapters)

components/
  ui/                     # Base primitives (button, dialog, dropdown, tabs, etc.)
  layout/                 # Sidebar, top bar, page frames, marketing shell/nav
  shared/                 # Logo, icon resolver, notifications + profile dropdowns
  dashboard/              # Journey cards, streak widget, add-folder/help/summarize dialogs
  journey/                # Journey-creation dialog, Ask METIS panel, roadmap, unit flowchart
  pricing/                # Shared pricing plans (public + logged-in)
  auth/                   # Auth page shell

lib/
  context/app-context.tsx # Single source of mock state (auth, journeys, folders, notifications)
  mock-data/              # All placeholder data, isolated for easy replacement:
                          #   journeys, notifications, resources, archive,
                          #   streak, chat, analytics, user
  utils.ts                # cn() class-merge helper

public/                   # Logo assets
```

## Running locally

Requires Node.js 18+.

```bash
npm install
npm run dev      # start the dev server at http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build (also type-checks)
npm run start    # serve the production build
```

### Demo flow

1. Open `http://localhost:3000` (public landing page).
2. Click **Sign In** / **Get Started** — any credentials work; submitting flips a mock
   "logged in" flag and routes to the dashboard.
3. From the dashboard, open a journey, create one, view the streak calendar, add a
   folder, or open Help.
4. Inside a journey, expand units, check off resources (progress updates live), open
   the **Ask METIS** panel, and drill into a unit.
5. Log out via the top-right profile menu to return to the landing page.

## Known limitations (Phase 1)

Everything below is intentionally placeholder at this stage:

- **Authentication** — a mock boolean toggle in React context; no real accounts,
  sessions, or password handling. Any credentials "work."
- **Database / persistence** — none. All data is hardcoded in `lib/mock-data/` and
  resets on page reload. No `localStorage`/`sessionStorage` is used.
- **Payments** — the pricing/upgrade flow is UI only. No Stripe, no billing.
- **AI chat & roadmap generation** — "Ask METIS" (Main/Planner/Tutor), journey
  summaries, and roadmap creation are static UI shells with placeholder content. No
  LLM calls.
- **Forms & uploads** — contact form, profile edits, and avatar upload update local UI
  state at most; nothing is sent anywhere.
- **Emails** — verification and password-reset screens are mock states; no email is sent.

## Roadmap

**Phase 2 — backend & AI.** Planned additions:

- **Supabase** — authentication, database, and persistent storage
- **Stripe** — subscriptions and payments for the Premium tier
- **Google Cloud** — infrastructure and supporting services
- **Multi-agent AI system** — the real Ask METIS tutor/planner, adaptive roadmap
  generation, and resource curation

The mock seams are deliberately isolated (`lib/mock-data/` and
`lib/context/app-context.tsx`) so they can be swapped for real services with minimal
churn to the UI.
