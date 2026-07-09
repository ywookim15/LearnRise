"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ResourceTypeIcon, resourceTypeLabel } from "@/components/shared/icon";
import type { UiResource } from "@/lib/data/journeys";
import { cn } from "@/lib/utils";

export function ResourceRow({
  resource,
  onToggle,
}: {
  resource: UiResource;
  onToggle: () => void;
}) {
  return (
    <div className="group/row relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/50">
      <Checkbox
        checked={resource.completed}
        onCheckedChange={onToggle}
        aria-label={`Mark ${resource.title} complete`}
      />
      <span className="w-8 shrink-0 text-xs font-semibold text-muted-foreground">
        {resource.label}
      </span>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="min-w-0 flex-1"
      >
        <p
          className={cn(
            "flex items-center gap-1.5 truncate text-sm font-medium group-hover/row:text-primary",
            resource.completed && "text-muted-foreground line-through"
          )}
        >
          {resource.title}
          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover/row:opacity-60" />
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {resourceTypeLabel[resource.type]} · {resource.source}
        </p>
      </a>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors group-hover/row:bg-card group-hover/row:text-primary">
        <ResourceTypeIcon type={resource.type} className="h-4 w-4" />
      </span>

      {/* Hover preview card (real curation metadata) */}
      <div className="pointer-events-none absolute left-11 top-full z-20 mt-1 w-80 origin-top-left scale-95 rounded-2xl border border-border bg-popover p-4 opacity-0 shadow-popover transition-all duration-150 group-hover/row:scale-100 group-hover/row:opacity-100">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ResourceTypeIcon type={resource.type} className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{resource.title}</p>
            <p className="truncate text-xs text-muted-foreground">{resource.source}</p>
          </div>
        </div>
        {resource.whyThisFits && (
          <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground">Why this fits: </span>
            {resource.whyThisFits}
          </p>
        )}
        {resource.videoTimestamp && (
          <p className="mt-2 line-clamp-2 text-[11px] text-muted-foreground">
            <span className="font-medium">Chapters:</span> {resource.videoTimestamp}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5">{resourceTypeLabel[resource.type]}</span>
          {resource.isTrusted && (
            <span className="flex items-center gap-1 text-emerald-600">
              <ShieldCheck className="h-3 w-3" />
              Trusted source
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
