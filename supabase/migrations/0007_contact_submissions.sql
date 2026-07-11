-- -----------------------------------------------------------------------------
-- 0007_contact_submissions — audit log + IP rate-limit source for the public
-- contact form (app/api/contact/route.ts). Unauthenticated route, so this is
-- written with the service-role client only; RLS has no policies at all, so
-- the anon/browser client can never read or write it directly.
-- -----------------------------------------------------------------------------

create table if not exists public.contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  ip         text,
  created_at timestamptz not null default now()
);

create index if not exists contact_submissions_ip_created_idx on public.contact_submissions (ip, created_at);

alter table public.contact_submissions enable row level security;
-- (intentionally no policies — service role only)
