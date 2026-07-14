-- -----------------------------------------------------------------------------
-- 0011_journey_language — the language a journey is taught in.
--
-- METIS localizes the AI pipeline (Planner roadmap, Curator resource search +
-- justifications, and the Ask-METIS tutor) to the learner's chosen language.
-- Each journey records the language it was created in so re-curation and
-- re-planning stay consistent even if the user later changes their default.
--
-- The user's DEFAULT learning language lives in auth user_metadata
-- (learning_language), set at signup and editable in Settings; it seeds this
-- column at journey-creation time. Defaults to 'en' so existing journeys and
-- any write that omits it keep working unchanged.
-- -----------------------------------------------------------------------------

alter table public.journeys
  add column if not exists learning_language text not null default 'en';
