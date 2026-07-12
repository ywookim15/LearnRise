-- -----------------------------------------------------------------------------
-- 0010_feature_usage_skill_adjust — extend feature_usage's feature check
-- constraint to allow 'skill_adjust', so the knowledge-map "Know it"/
-- "Familiar" mark (which triggers a Planner + Curator call per chapter) can
-- be rate-limited for free users the same way chat_message/replan already
-- are. Without this migration, record_feature_usage() silently fails to
-- insert 'skill_adjust' rows (feature_usage's CHECK constraint rejects the
-- value) and the app-side check fails open (see usage-limits.ts's
-- increment() comment) — so the route still works, but the new cap has no
-- effect until this runs.
-- -----------------------------------------------------------------------------

alter table public.feature_usage drop constraint if exists feature_usage_feature_check;
alter table public.feature_usage add constraint feature_usage_feature_check
  check (feature in ('chat_message', 'replan', 'skill_adjust'));
