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
  Atom,
  Calculator,
  Globe,
  Code,
  Microscope,
  BookOpen,
  Music,
  FileText,
  ListChecks,
  Play,
  Folder,
  type LucideIcon,
} from "lucide-react";
import type { DbResourceType } from "@/lib/data/journeys";

// Maps the string icon names (derived from journey id) to Lucide components.
const ICONS: Record<string, LucideIcon> = {
  Boxes, Brain, PenTool, Sparkles, Terminal, Dna, PiggyBank, Languages,
  Palette, Atom, Calculator, Globe, Code, Microscope, BookOpen, Music, Folder,
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

// The three real DB resource types (Phase 2).
const RESOURCE_ICONS: Record<DbResourceType, LucideIcon> = {
  video: Play,
  article: FileText,
  practice_set: ListChecks,
};

export function ResourceTypeIcon({
  type,
  className,
}: {
  type: DbResourceType;
  className?: string;
}) {
  const Cmp = RESOURCE_ICONS[type] ?? FileText;
  return <Cmp className={className} />;
}

export const resourceTypeLabel: Record<DbResourceType, string> = {
  video: "Video",
  article: "Article",
  practice_set: "Practice",
};
