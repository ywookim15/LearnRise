-- -----------------------------------------------------------------------------
-- 0008_resource_completed_at — the ONE piece of tracking infrastructure the
-- Analytics page genuinely needs and doesn't have: a timestamp for WHEN a
-- resource was marked complete. Every other table only stores current state
-- (is_complete booleans), not history, so "completed this week/month" and a
-- 30-day trend chart are otherwise impossible to compute honestly.
--
-- Set/cleared by the app (lib/data/journeys.ts setResourceComplete) alongside
-- is_complete — not a trigger, since un-completing a resource should clear it
-- rather than leave a stale timestamp.
-- -----------------------------------------------------------------------------

alter table public.resources
  add column if not exists completed_at timestamptz;

create index if not exists resources_completed_at_idx on public.resources (completed_at);
