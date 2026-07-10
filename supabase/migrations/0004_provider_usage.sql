-- -----------------------------------------------------------------------------
-- 0004_provider_usage — AI provider usage/rate-limit tracking
--
-- One aggregated row per (provider, UTC day). The server increments it once per
-- LLM / Tavily call and stamps the last rate-limit hit, so the dashboard can
-- show "how much of today's limit have I used" and "am I currently throttled".
--
-- Server-only: RLS is enabled with NO policies, so only the service-role client
-- (which bypasses RLS) can read/write. The browser reads aggregates through the
-- GET /api/usage route, never the table directly.
-- -----------------------------------------------------------------------------

create table if not exists public.provider_usage (
  provider              text        not null,
  day                   date        not null,
  call_count            integer     not null default 0,
  rate_limited_count    integer     not null default 0,
  last_rate_limited_at  timestamptz,
  last_retry_after_sec  integer,
  updated_at            timestamptz not null default now(),
  primary key (provider, day)
);

alter table public.provider_usage enable row level security;
-- (intentionally no policies — service role only)

-- Atomic upsert-increment. security definer so it runs as the owner and is not
-- blocked by RLS; callable only by the service role.
create or replace function public.record_provider_usage(
  p_provider     text,
  p_rate_limited boolean default false,
  p_retry_after  integer default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.provider_usage as pu (
    provider, day, call_count, rate_limited_count,
    last_rate_limited_at, last_retry_after_sec, updated_at
  ) values (
    p_provider,
    (now() at time zone 'utc')::date,
    1,
    case when p_rate_limited then 1 else 0 end,
    case when p_rate_limited then now() else null end,
    case when p_rate_limited then p_retry_after else null end,
    now()
  )
  on conflict (provider, day) do update set
    call_count           = pu.call_count + 1,
    rate_limited_count   = pu.rate_limited_count + (case when p_rate_limited then 1 else 0 end),
    last_rate_limited_at = case when p_rate_limited then now() else pu.last_rate_limited_at end,
    last_retry_after_sec = case when p_rate_limited then p_retry_after else pu.last_retry_after_sec end,
    updated_at           = now();
end;
$$;

revoke all on function public.record_provider_usage(text, boolean, integer) from public;
grant execute on function public.record_provider_usage(text, boolean, integer) to service_role;
