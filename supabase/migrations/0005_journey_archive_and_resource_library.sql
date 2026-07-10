-- -----------------------------------------------------------------------------
-- 0005_journey_archive_and_resource_library
--
-- Two features:
--
-- 1) Real journey archive (replaces the mock Archive page):
--    - journeys.completed_at: set automatically once every resource in the
--      journey is checked off; cleared if the student unchecks one later.
--    - journeys.deleted_at: soft delete ("Delete journey"). The journey moves
--      to the Archive page's Deleted section, recoverable, until the user
--      permanently deletes it (a real DELETE, cascading as before).
--
-- 2) Real "My Resources" hub (replaces the mock Resources page):
--    - resources.saved_at: bookmark a resource from any journey.
--    - resource_folders / resource_folder_items: user-owned folders that saved
--      resources can be filed into (Drive-style — a resource lives in at most
--      one folder, enforced by resource_id being the join table's PK).
--
-- Run manually in the Supabase SQL Editor (not auto-applied).
-- -----------------------------------------------------------------------------

-- ============================================================
-- 1) Journey archive
-- ============================================================
alter table public.journeys
  add column if not exists completed_at timestamptz,
  add column if not exists deleted_at timestamptz;

create index if not exists journeys_completed_at_idx on public.journeys (completed_at);
create index if not exists journeys_deleted_at_idx   on public.journeys (deleted_at);

-- ============================================================
-- 2) Saved resources
-- ============================================================
alter table public.resources
  add column if not exists saved_at timestamptz;

create index if not exists resources_saved_at_idx on public.resources (saved_at);

-- ============================================================
-- 3) Resource folders (mirrors the journeys/units/chapters ownership pattern)
-- ============================================================
create table if not exists public.resource_folders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

create index if not exists resource_folders_user_id_idx on public.resource_folders (user_id);

create table if not exists public.resource_folder_items (
  -- resource_id is the PK (not a composite key): a saved resource lives in at
  -- most one folder, so filing it elsewhere is a plain upsert.
  resource_id uuid primary key references public.resources (id) on delete cascade,
  folder_id   uuid not null references public.resource_folders (id) on delete cascade,
  added_at    timestamptz not null default now()
);

create index if not exists resource_folder_items_folder_id_idx on public.resource_folder_items (folder_id);

-- ---- ownership helpers ----
create or replace function public.user_owns_resource(p_resource_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1
    from public.resources r
    join public.chapters c  on c.id = r.chapter_id
    join public.units u     on u.id = c.unit_id
    join public.journeys j  on j.id = u.journey_id
    where r.id = p_resource_id
      and j.user_id = (select auth.uid())
  );
$$;

create or replace function public.user_owns_resource_folder(p_folder_id uuid)
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.resource_folders f
    where f.id = p_folder_id
      and f.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.user_owns_resource(uuid) from anon;
revoke execute on function public.user_owns_resource_folder(uuid) from anon;

-- ---- RLS: resource_folders ----
alter table public.resource_folders enable row level security;

create policy "resource_folders_select_own"
  on public.resource_folders for select to authenticated
  using (user_id = (select auth.uid()));

create policy "resource_folders_insert_own"
  on public.resource_folders for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "resource_folders_update_own"
  on public.resource_folders for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "resource_folders_delete_own"
  on public.resource_folders for delete to authenticated
  using (user_id = (select auth.uid()));

-- ---- RLS: resource_folder_items ----
alter table public.resource_folder_items enable row level security;

create policy "resource_folder_items_select_own"
  on public.resource_folder_items for select to authenticated
  using (public.user_owns_resource_folder(folder_id));

create policy "resource_folder_items_insert_own"
  on public.resource_folder_items for insert to authenticated
  with check (
    public.user_owns_resource_folder(folder_id)
    and public.user_owns_resource(resource_id)
  );

create policy "resource_folder_items_update_own"
  on public.resource_folder_items for update to authenticated
  using (public.user_owns_resource_folder(folder_id))
  with check (
    public.user_owns_resource_folder(folder_id)
    and public.user_owns_resource(resource_id)
  );

create policy "resource_folder_items_delete_own"
  on public.resource_folder_items for delete to authenticated
  using (public.user_owns_resource_folder(folder_id));
