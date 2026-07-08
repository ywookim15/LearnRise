import {
  Boxes,
  Brain,
  PenTool,
  Sparkles,
  Terminal,
  Dna,
  PiggyBank,
  Languages,
  Palette,
  BookOpen,
  FileText,
  FlaskConical,
  Play,
  ListChecks,
  Folder,
  type LucideIcon,
} from "lucide-react";
import type { ResourceType } from "@/lib/mock-data/journeys";

// Maps the string icon names used in mock data to real Lucide components,
// so mock data stays plain/serializable and easy to swap in Phase 2.
const ICONS: Record<string, LucideIcon> = {
  Boxes,
  Brain,
  PenTool,
  Sparkles,
  Terminal,
  Dna,
  PiggyBank,
  Languages,
  Palette,
  Folder,
};

export function JourneyIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp className={className} />;
}

const RESOURCE_ICONS: Record<ResourceType, LucideIcon> = {
  video: Play,
  article: FileText,
  reading: BookOpen,
  lab: FlaskConical,
  quiz: ListChecks,
};

export function ResourceTypeIcon({
  type,
  className,
}: {
  type: ResourceType;
  className?: string;
}) {
  const Cmp = RESOURCE_ICONS[type];
  return <Cmp className={className} />;
}

export const resourceTypeLabel: Record<ResourceType, string> = {
  video: "Video",
  article: "Article",
  reading: "Reading",
  lab: "Interactive Lab",
  quiz: "Quiz",
};
