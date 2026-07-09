// "My Resources" saved/favorited hub. A real saved-resources feature arrives
// later; empty for now (no fake data). Uses the real 3 resource types so it
// stays compatible with the shared icon component.

import type { DbResourceType } from "@/lib/data/journeys";

export interface SavedResource {
  id: string;
  title: string;
  source: string;
  type: DbResourceType;
  duration: string;
  savedFrom: string; // which journey it came from
  folder: string | null;
}

export interface ResourceFolder {
  id: string;
  name: string;
  count: number;
}

export const mockResourceFolders: ResourceFolder[] = [];

export const mockSavedResources: SavedResource[] = [];
