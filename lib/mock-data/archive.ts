// MOCK DATA — Archive page: completed and deleted journeys.

export interface CompletedJourney {
  id: string;
  name: string;
  description: string;
  completedOn: string;
  resourceCount: number;
  icon: string;
}

export interface DeletedJourney {
  id: string;
  name: string;
  description: string;
  deletedOn: string;
  daysUntilPurge: number; // auto-purged after 30 days
  icon: string;
}

export const mockCompletedJourneys: CompletedJourney[] = [
  {
    id: "c1",
    name: "Learn Python from Scratch",
    description: "From variables to virtual environments — a complete beginner track.",
    completedOn: "Completed May 2, 2026",
    resourceCount: 42,
    icon: "Terminal",
  },
  {
    id: "c2",
    name: "Ace AP Biology: Genetics Unit",
    description: "Mendelian inheritance, DNA replication, and gene expression.",
    completedOn: "Completed Mar 18, 2026",
    resourceCount: 28,
    icon: "Dna",
  },
  {
    id: "c3",
    name: "Intro to Personal Finance",
    description: "Budgeting, compound interest, and index-fund investing basics.",
    completedOn: "Completed Jan 9, 2026",
    resourceCount: 19,
    icon: "PiggyBank",
  },
];

export const mockDeletedJourneys: DeletedJourney[] = [
  {
    id: "d1",
    name: "Conversational Japanese",
    description: "Hiragana, katakana, and everyday travel phrases.",
    deletedOn: "Deleted Jul 1, 2026",
    daysUntilPurge: 23,
    icon: "Languages",
  },
  {
    id: "d2",
    name: "Watercolor Fundamentals",
    description: "Washes, wet-on-wet, and building up transparent layers.",
    deletedOn: "Deleted Jun 20, 2026",
    daysUntilPurge: 12,
    icon: "Palette",
  },
];
