// MOCK DATA — the "My Resources" saved/favorited hub.
// (Still mock in Phase 2 — out of the Step 5 scope. Uses the real 3 resource
// types so it stays compatible with the shared icon component.)

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

export const mockResourceFolders: ResourceFolder[] = [
  { id: "f-read-later", name: "Read Later", count: 3 },
  { id: "f-favorites", name: "Favorites", count: 2 },
  { id: "f-references", name: "Reference Material", count: 2 },
];

export const mockSavedResources: SavedResource[] = [
  {
    id: "sr1",
    title: "The Eight Fallacies of Distributed Computing",
    source: "Arch Weekly",
    type: "article",
    duration: "12 min",
    savedFrom: "Systems Architecture",
    folder: "f-favorites",
  },
  {
    id: "sr2",
    title: "The Raft Paper, Annotated",
    source: "Papers We Love",
    type: "article",
    duration: "40 min",
    savedFrom: "Systems Architecture",
    folder: "f-references",
  },
  {
    id: "sr3",
    title: "Thinking, Fast and Slow — Overview",
    source: "Book Notes",
    type: "article",
    duration: "30 min",
    savedFrom: "Cognitive Psychology",
    folder: "f-favorites",
  },
  {
    id: "sr4",
    title: "The Invisible Gorilla",
    source: "Perception Lab",
    type: "video",
    duration: "9 min",
    savedFrom: "Cognitive Psychology",
    folder: "f-read-later",
  },
  {
    id: "sr5",
    title: "A Theory of Design Tokens",
    source: "Design Ops",
    type: "article",
    duration: "13 min",
    savedFrom: "Design Systems 2.0",
    folder: "f-read-later",
  },
  {
    id: "sr6",
    title: "Naming Tokens Without Regret",
    source: "Systems Studio",
    type: "video",
    duration: "18 min",
    savedFrom: "Design Systems 2.0",
    folder: "f-read-later",
  },
  {
    id: "sr7",
    title: "Variants, Slots, and Composition",
    source: "Systems Studio",
    type: "article",
    duration: "16 min",
    savedFrom: "Design Systems 2.0",
    folder: "f-references",
  },
];
