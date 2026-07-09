-- ============================================================================
-- METIS Phase 2 — Migration 0001: Journey Generation Schema
-- ============================================================================
-- Run this manually in the Supabase SQL Editor. It is NOT auto-applied.
--
-- Creates the five tables backing the journey-generation pipeline
-- (METIS_Journey_Algorithm_v2 Stages 2-6):
--   journeys, units, chapters, resources, journey_chat_memory
-- plus real per-user Row Level Security on every table, ownership always
-- resolving back to journeys.user_id -> auth.users.
--
-- Notes:
--   * gen_random_uuid() is built into Supabase's Postgres — no extension setup.
--   * The server-side API routes use the service-role key and bypass RLS;
--     these policies protect anything the browser client can reach.
--   * The view at the bottom uses security_invoker (Postgres 15+, standard on
--     current Supabase projects) so it respects the underlying RLS.
-- ============================================================================


-- ============================================================
-- Helper: keep updated_at fresh on journey_chat_memory
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- Tables
-- ============================================================

-- ---- journeys: one row per learning journey (Stage 1 inputs + Stage 2 output header)
create table public.journeys (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  -- Stage 1 raw inputs (free text, no validation loop per the algorithm doc)
  goal                  text not null,
  current_level         text,
  preferences           text,
  start_date            date,
  end_date              date,
  hours_per_week        integer check (hours_per_week is null or hours_per_week between 1 and 168),
  -- Stage 2 Planner output (journey-level fields)
  journey_name          text not null,
  estimated_total_weeks numeric(5,1),
  created_at            timestamptz not null default now()
);

comment on table public.journeys is
  'One learning journey per row: Stage 1 creation inputs + Stage 2 Planner header output.';

-- ---- units: Stage 2 Planner output, dynamically sized per journey
create table public.units (
  id              uuid primary key default gen_random_uuid(),
  journey_id      uuid not null references public.journeys (id) on delete cascade,
  unit_number     integer not null,
  unit_title      text not null,
  estimated_weeks numeric(4,1),
  unique (journey_id, unit_number)
);

-- ---- chapters: Stage 2 Planner output; completion + curation status live here
create table public.chapters (
  id                 uuid primary key default gen_random_uuid(),
  unit_id            uuid not null references public.units (id) on delete cascade,
  chapter_number     text not null, -- e.g. '1-1', matches the Planner output schema
  chapter_title      text not null,
  learning_objective text,
  is_complete        boolean not null default false,
  -- Stage 3 runs asynchronously after the skeleton is stored; the frontend needs
  -- to distinguish "resources still populating" from "curation finished" from
  -- the Stage 3 fallback case "searched, found nothing usable — flagged gap".
  resource_status    text not null default 'pending'
    check (resource_status in ('pending', 'complete', 'no_resources_found')),
  unique (unit_id, chapter_number)
);

comment on column public.chapters.resource_status is
  'Stage 3 curation state: pending (async curation not finished), complete, or no_resources_found (flagged gap per the algorithm fallback).';

-- ---- resources: Stage 3 Curator output, 1-3 per chapter
create table public.resources (
  id                uuid primary key default gen_random_uuid(),
  chapter_id        uuid not null references public.chapters (id) on delete cascade,
  title             text not null,
  url               text not null,
  source_name       text,
  resource_type     text not null
    check (resource_type in ('video', 'article', 'practice_set')),
  video_timestamp   text,            -- nullable; only set for videos w/ YouTube API data
  why_this_fits     text,
  is_trusted_domain boolean not null default false, -- lateral-reading shortcut applied (Stage 3 step 5)
  -- Per-resource checkbox state driving the Phase 1 UI's progress bars.
  -- chapters.is_complete stays as the chapter-level rollup (see migration notes).
  is_complete       boolean not null default false,
  created_at        timestamptz not null default now()
);

-- ---- journey_chat_memory: Stage 5 compressed Memory (NOT raw chat history)
create table public.journey_chat_memory (
  id               uuid primary key default gen_random_uuid(),
  journey_id       uuid not null references public.journeys (id) on delete cascade,
  compressed_notes text not null default '',
  updated_at       timestamptz not null default now(),
  -- Memory scope is per-journey (algorithm doc assumption): exactly one memory
  -- row per journey, which also makes server-side upserts trivial.
  unique (journey_id)
);

create trigger journey_chat_memory_set_updated_at
  before update on public.journey_chat_memory
  for each row execute function public.set_updated_at();


-- ============================================================
-- Indexes (FK lookups + RLS ownership-chain performance)
-- ============================================================
create index journeys_user_id_idx        on public.journeys (user_id);
create index units_journey_id_idx        on public.units (journey_id);
create index chapters_unit_id_idx        on public.chapters (unit_id);
create index resources_chapter_id_idx    on public.resources (chapter_id);
-- journey_chat_memory.journey_id is covered by its UNIQUE constraint


-- ============================================================
-- Ownership helpers for RLS
-- ============================================================
-- SECURITY DEFINER so the ownership check reads the parent tables directly
-- instead of re-entering their RLS policies (the standard Supabase pattern
-- for chained ownership). Each function answers one question: does the
-- currently authenticated user own the journey this row hangs off of?

create or replace function public.user_owns_journey(p_journey_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.journeys j
    where j.id = p_journey_id
      and j.user_id = (select auth.uid())
  );
$$;

create or replace function public.user_owns_unit(p_unit_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.units u
    join public.journeys j on j.id = u.journey_id
    where u.id = p_unit_id
      and j.user_id = (select auth.uid())
  );
$$;

create or replace function public.user_owns_chapter(p_chapter_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.chapters c
    join public.units u    on u.id = c.unit_id
    join public.journeys j on j.id = u.journey_id
    where c.id = p_chapter_id
      and j.user_id = (select auth.uid())
  );
$$;

-- Lock the helpers down: only usable via RLS evaluation for API roles.
revoke execute on function public.user_owns_journey(uuid) from anon;
revoke execute on function public.user_owns_unit(uuid) from anon;
revoke execute on function public.user_owns_chapter(uuid) from anon;


-- ============================================================
-- Row Level Security
-- ============================================================
-- Every table: RLS enabled + explicit per-operation policies scoped to the
-- `authenticated` role. No policy exists for `anon`, so anonymous users get
-- nothing. Ownership always chains back to journeys.user_id = auth.uid().

-- ---------------- journeys ----------------
alter table public.journeys enable row level security;

create policy "journeys_select_own"
  on public.journeys for select to authenticated
  using (user_id = (select auth.uid()));

create policy "journeys_insert_own"
  on public.journeys for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "journeys_update_own"
  on public.journeys for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "journeys_delete_own"
  on public.journeys for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---------------- units ----------------
alter table public.units enable row level security;

create policy "units_select_own"
  on public.units for select to authenticated
  using (public.user_owns_journey(journey_id));

create policy "units_insert_own"
  on public.units for insert to authenticated
  with check (public.user_owns_journey(journey_id));

create policy "units_update_own"
  on public.units for update to authenticated
  using (public.user_owns_journey(journey_id))
  with check (public.user_owns_journey(journey_id));

create policy "units_delete_own"
  on public.units for delete to authenticated
  using (public.user_owns_journey(journey_id));

-- ---------------- chapters ----------------
alter table public.chapters enable row level security;

create policy "chapters_select_own"
  on public.chapters for select to authenticated
  using (public.user_owns_unit(unit_id));

create policy "chapters_insert_own"
  on public.chapters for insert to authenticated
  with check (public.user_owns_unit(unit_id));

create policy "chapters_update_own"
  on public.chapters for update to authenticated
  using (public.user_owns_unit(unit_id))
  with check (public.user_owns_unit(unit_id));

create policy "chapters_delete_own"
  on public.chapters for delete to authenticated
  using (public.user_owns_unit(unit_id));

-- ---------------- resources ----------------
alter table public.resources enable row level security;

create policy "resources_select_own"
  on public.resources for select to authenticated
  using (public.user_owns_chapter(chapter_id));

create policy "resources_insert_own"
  on public.resources for insert to authenticated
  with check (public.user_owns_chapter(chapter_id));

create policy "resources_update_own"
  on public.resources for update to authenticated
  using (public.user_owns_chapter(chapter_id))
  with check (public.user_owns_chapter(chapter_id));

create policy "resources_delete_own"
  on public.resources for delete to authenticated
  using (public.user_owns_chapter(chapter_id));

-- ---------------- journey_chat_memory ----------------
alter table public.journey_chat_memory enable row level security;

create policy "journey_chat_memory_select_own"
  on public.journey_chat_memory for select to authenticated
  using (public.user_owns_journey(journey_id));

create policy "journey_chat_memory_insert_own"
  on public.journey_chat_memory for insert to authenticated
  with check (public.user_owns_journey(journey_id));

create policy "journey_chat_memory_update_own"
  on public.journey_chat_memory for update to authenticated
  using (public.user_owns_journey(journey_id))
  with check (public.user_owns_journey(journey_id));

create policy "journey_chat_memory_delete_own"
  on public.journey_chat_memory for delete to authenticated
  using (public.user_owns_journey(journey_id));


-- ============================================================
-- Stage 3/4: journey-level media-type ratio (lightweight view)
-- ============================================================
-- Used by the Curator's post-pass to check whether the student's preferred
-- media type is under-represented across the WHOLE journey (the algorithm doc
-- is explicit that this check is journey-level, not per-chapter).
-- security_invoker => the querying user's RLS applies to the underlying tables.
create view public.journey_media_type_ratio
  with (security_invoker = true)
as
select
  j.id                                                              as journey_id,
  r.resource_type,
  count(*)                                                          as resource_count,
  round(count(*)::numeric / sum(count(*)) over (partition by j.id), 3) as share
from public.journeys j
join public.units u     on u.journey_id = j.id
join public.chapters c  on c.unit_id = u.id
join public.resources r on r.chapter_id = c.id
group by j.id, r.resource_type;

comment on view public.journey_media_type_ratio is
  'Per-journey share of each resource_type, for the Stage 3 journey-level media-type ratio check.';
