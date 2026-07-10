"use client";

// -----------------------------------------------------------------------------
// "MY RESOURCES" DATA LAYER — saved/bookmarked resources (across all journeys)
// plus the folders a student can file them into. Mirrors the ownership chain
// used everywhere else (resources -> chapters -> units -> journeys), scoped by
// RLS to the signed-in user. See migration 0005_journey_archive_and_resource_library.
// -----------------------------------------------------------------------------

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DbResourceType } from "@/lib/data/journeys";

export interface UiSavedResource {
  id: string;
  title: string;
  source: string;
  type: DbResourceType;
  url: string;
  whyThisFits: string;
  isTrusted: boolean;
  savedFrom: string; // journey name it was curated for
  folderId: string | null;
}

export interface UiResourceFolder {
  id: string;
  name: string;
  count: number;
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** All resources the student has bookmarked, across every journey. */
export async function listSavedResources(): Promise<UiSavedResource[]> {
  const supabase = getSupabaseBrowserClient();

  const [{ data: rows, error }, { data: items, error: itemsErr }] = await Promise.all([
    supabase
      .from("resources")
      .select(
        `id, title, url, source_name, resource_type, why_this_fits, is_trusted_domain, saved_at,
         chapters ( units ( journeys ( journey_name ) ) )`
      )
      .not("saved_at", "is", null)
      .order("saved_at", { ascending: false }),
    supabase.from("resource_folder_items").select("resource_id, folder_id"),
  ]);
  if (error) throw error;
  if (itemsErr) throw itemsErr;

  const folderByResource = new Map((items ?? []).map((i) => [i.resource_id as string, i.folder_id as string]));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (rows ?? []).map((r: any): UiSavedResource => ({
    id: r.id,
    title: r.title ?? "",
    source: r.source_name ?? hostnameOf(r.url ?? ""),
    type: (r.resource_type ?? "article") as DbResourceType,
    url: r.url ?? "",
    whyThisFits: r.why_this_fits ?? "",
    isTrusted: !!r.is_trusted_domain,
    savedFrom: r.chapters?.units?.journeys?.journey_name ?? "Unknown journey",
    folderId: folderByResource.get(r.id) ?? null,
  }));
}

export async function listResourceFolders(): Promise<UiResourceFolder[]> {
  const supabase = getSupabaseBrowserClient();
  const [{ data: folders, error }, { data: items, error: itemsErr }] = await Promise.all([
    supabase.from("resource_folders").select("id, name").order("created_at", { ascending: true }),
    supabase.from("resource_folder_items").select("folder_id"),
  ]);
  if (error) throw error;
  if (itemsErr) throw itemsErr;

  const counts = new Map<string, number>();
  for (const it of items ?? []) {
    counts.set(it.folder_id as string, (counts.get(it.folder_id as string) ?? 0) + 1);
  }

  return (folders ?? []).map((f) => ({
    id: f.id,
    name: f.name,
    count: counts.get(f.id) ?? 0,
  }));
}

export async function createResourceFolder(name: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not authenticated");
  const { error } = await supabase.from("resource_folders").insert({ user_id: auth.user.id, name });
  if (error) throw error;
}

export async function renameResourceFolder(id: string, name: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("resource_folders").update({ name }).eq("id", id);
  if (error) throw error;
}

/** Deletes the folder; its saved resources stay saved, just unfiled. */
export async function deleteResourceFolder(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("resource_folders").delete().eq("id", id);
  if (error) throw error;
}

/** Files a saved resource into a folder (Drive-style: at most one folder each). */
export async function addResourceToFolder(folderId: string, resourceId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("resource_folder_items")
    .upsert({ resource_id: resourceId, folder_id: folderId }, { onConflict: "resource_id" });
  if (error) throw error;
}

export async function removeResourceFromFolder(resourceId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("resource_folder_items").delete().eq("resource_id", resourceId);
  if (error) throw error;
}
