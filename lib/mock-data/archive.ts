// Archive page data. Real completed/deleted journeys arrive with a future
// archive feature; empty for now (no fake data).

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

export const mockCompletedJourneys: CompletedJourney[] = [];

export const mockDeletedJourneys: DeletedJourney[] = [];
