-- ============================================================================
-- METIS Phase 2b — Migration 0002: Stripe subscriptions
-- ============================================================================
-- Run this manually in the Supabase SQL Editor. It is NOT auto-applied.
--
-- One row per user tracking their Stripe billing state. Writes happen ONLY
-- server-side (checkout route + webhook, via the service-role key, which
-- bypasses RLS). Users may READ their own row and nothing else.
--
-- Reuses public.set_updated_at() from migration 0001.
-- ============================================================================

create table public.subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null unique references auth.users (id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  -- 'free' is the default; 'premium'/'family' are set by the webhook once a
  -- Stripe subscription is active.
  plan                   text not null default 'free'
                           check (plan in ('free', 'premium', 'family')),
  -- Mirrors Stripe subscription status ('active', 'trialing', 'past_due',
  -- 'canceled', ...) or 'inactive' before any subscription exists.
  status                 text not null default 'inactive',
  current_period_end     timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

comment on table public.subscriptions is
  'Per-user Stripe billing state. Written server-side only (checkout + webhook via service role); users can read their own row via RLS.';

-- Webhook lookups resolve a Stripe customer/subscription back to the user row.
create index subscriptions_stripe_customer_idx on public.subscriptions (stripe_customer_id);
create index subscriptions_stripe_subscription_idx on public.subscriptions (stripe_subscription_id);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ---------------- Row Level Security ----------------
alter table public.subscriptions enable row level security;

-- Read-only for the owner. No insert/update/delete policies exist for
-- `authenticated`, so the browser client can never mutate billing state —
-- only the service-role server code can.
create policy "subscriptions_select_own"
  on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()));
