"use client";

import { useState } from "react";
import { Folder as FolderIcon, FolderPlus, Bookmark } from "lucide-react";
import { AppPage } from "@/components/layout/app-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddFolderDialog } from "@/components/dashboard/add-folder-dialog";
import { ResourceTypeIcon, resourceTypeLabel } from "@/components/shared/icon";
import { mockResourceFolders, mockSavedResources, type ResourceFolder } from "@/lib/mock-data/resources";

export default function ResourcesPage() {
  const [folders, setFolders] = useState<ResourceFolder[]>(mockResourceFolders);
  const [dialogOpen, setDialogOpen] = useState(false);

  function addFolder(name: string) {
    setFolders((prev) => [...prev, { id: `rf-${Date.now()}`, name, count: 0 }]);
  }

  return (
    <AppPage showMemoryAgent={false}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Resources</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Everything you&apos;ve saved and favorited across your journeys, in one hub.
          </p>
        </div>
      </div>

      {/* Folders */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Folders
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FolderIcon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{folder.name}</p>
                <p className="text-xs text-muted-foreground">{folder.count} items</p>
              </div>
            </div>
          ))}
          <button
            onClick={() => setDialogOpen(true)}
            className="group flex items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/40 p-4 text-left transition-colors hover:border-primary/50 hover:bg-brand-gradient-soft"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <FolderPlus className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold">New folder</span>
          </button>
        </div>
      </div>

      {/* Saved resources */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Saved resources
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockSavedResources.map((res) => (
            <div
              key={res.id}
              className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ResourceTypeIcon type={res.type} className="h-5 w-5" />
                </span>
                <Bookmark className="h-4 w-4 fill-primary text-primary" />
              </div>
              <h3 className="mt-4 line-clamp-2 text-sm font-semibold leading-snug">{res.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {resourceTypeLabel[res.type]} · {res.source} · {res.duration}
              </p>
              <div className="mt-4 pt-1">
                <Badge variant="muted">{res.savedFrom}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        <Button
          variant="gradient"
          className="h-11 rounded-full px-5 shadow-brand"
          onClick={() => setDialogOpen(true)}
        >
          <FolderPlus className="h-4 w-4" />
          Add Folder
        </Button>
      </div>

      <AddFolderDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={addFolder} />
    </AppPage>
  );
}
