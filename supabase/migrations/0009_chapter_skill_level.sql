-- -----------------------------------------------------------------------------
-- 0009_chapter_skill_level — persists the "Know it" / "Familiar" mark a
-- student sets on a chapter node in the unit knowledge map (previously
-- client-only React state, lost on refresh). Drives a narrow-scope Planner +
-- Curator adjustment for that single chapter — see
-- app/api/journeys/[id]/chapters/[chapterId]/skill-level/route.ts.
-- -----------------------------------------------------------------------------

alter table public.chapters
  add column if not exists skill_level text not null default 'unset'
    check (skill_level in ('unset', 'familiar', 'known'));
