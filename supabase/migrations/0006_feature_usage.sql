-- -----------------------------------------------------------------------------
-- 0006_feature_usage — Free-tier usage limits (chat messages/day, adaptive
-- re-routes/month), enforced server-side so a free user can't bypass them by
-- calling the API directly or tampering with client state.
--
-- One row per (user, feature, period). 'chat_message' periods are UTC days;
-- 'replan' periods are the first of the UTC month. The API route peeks the
-- current count before deciding whether to serve the request, then calls
-- record_feature_usage() to atomically increment.
--
-- Server-only: RLS is enabled with NO policies, so only the service-role
-- client can read/write — matches the provider_usage pattern from 0004.
-- -----------------------------------------------------------------------------

create table if not exists public.feature_usage (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  feature      text        not null check (feature in ('chat_message', 'replan')),
  period_start date        not null,
  count        integer     not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (user_id, feature, period_start)
);

create index if not exists feature_usage_lookup_idx on public.feature_usage (user_id, feature, period_start);

alter table public.feature_usage enable row level security;
-- (intentionally no policies — service role only)

-- Atomic upsert-increment; returns the count AFTER incrementing so the caller
-- can immediately compare it against the plan's limit.
create or replace function public.record_feature_usage(
  p_user_id      uuid,
  p_feature      text,
  p_period_start date
) returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.feature_usage as fu (user_id, feature, period_start, count, updated_at)
  values (p_user_id, p_feature, p_period_start, 1, now())
  on conflict (user_id, feature, period_start) do update set
    count      = fu.count + 1,
    updated_at = now()
  returning fu.count into v_count;

  return v_count;
end;
$$;

revoke all on function public.record_feature_usage(uuid, text, date) from public;
grant execute on function public.record_feature_usage(uuid, text, date) to service_role;
