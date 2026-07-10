"use client";

import { useEffect, useRef, useState } from "react";
import {
  Folder as FolderIcon,
  FolderPlus,
  FolderOpen,
  Bookmark,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AppPage } from "@/components/layout/app-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddFolderDialog } from "@/components/dashboard/add-folder-dialog";
import { ResourceTypeIcon, resourceTypeLabel } from "@/components/shared/icon";
import { useResourceLibrary } from "@/lib/data/use-resource-library";
import {
  createResourceFolder,
  renameResourceFolder,
  deleteResourceFolder,
  addResourceToFolder,
  removeResourceFromFolder,
  type UiResourceFolder,
  type UiSavedResource,
} from "@/lib/data/resource-library";
import { setResourceSaved } from "@/lib/data/journeys";
import { cn } from "@/lib/utils";

const DND_KEY = "text/metis-resource-id";

export default function ResourcesPage() {
  const { resources, folders, loading, error, refresh } = useResourceLibrary();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<UiResourceFolder | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const dragCounters = useRef<Record<string, number>>({});

  const unfiled = resources.filter((r) => !r.folderId);
  const openFolder = folders.find((f) => f.id === openFolderId) ?? null;
  const resourcesInOpenFolder = openFolder
    ? resources.filter((r) => r.folderId === openFolder.id)
    : [];

  async function handleAddFolder(name: string) {
    await createResourceFolder(name);
    await refresh();
  }

  function handleDragEnterFolder(folderId: string) {
    dragCounters.current[folderId] = (dragCounters.current[folderId] ?? 0) + 1;
    setDragOverFolder(folderId);
  }
  function handleDragLeaveFolder(folderId: string) {
    const next = (dragCounters.current[folderId] ?? 0) - 1;
    dragCounters.current[folderId] = next;
    if (next <= 0) {
      dragCounters.current[folderId] = 0;
      setDragOverFolder((cur) => (cur === folderId ? null : cur));
    }
  }
  async function handleDropOnFolder(e: React.DragEvent, folderId: string) {
    e.preventDefault();
    dragCounters.current[folderId] = 0;
    setDragOverFolder(null);
    const resourceId = e.dataTransfer.getData(DND_KEY);
    if (!resourceId) return;
    await addResourceToFolder(folderId, resourceId);
    await refresh();
  }

  async function handleUnsave(resourceId: string) {
    await setResourceSaved(resourceId, false);
    await refresh();
  }

  async function handleRemoveFromFolder(resourceId: string) {
    await removeResourceFromFolder(resourceId);
    await refresh();
  }

  return (
    <AppPage showMemoryAgent={false}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Resources</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Everything you&apos;ve saved from your journeys, in one hub.
            {folders.length > 0 && " Drag a resource onto a folder to file it."}
          </p>
        </div>
      </div>

      {error ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">Couldn&apos;t load your resources: {error}</p>
          <Button variant="outline" size="sm" onClick={() => refresh()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : loading ? (
        <div className="mt-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Folders */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Folders
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onDragEnter={(e) => {
                    e.preventDefault();
                    handleDragEnterFolder(folder.id);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={() => handleDragLeaveFolder(folder.id)}
                  onDrop={(e) => void handleDropOnFolder(e, folder.id)}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-card transition-all",
                    dragOverFolder === folder.id
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:shadow-card-hover"
                  )}
                >
                  <button
                    onClick={() => setOpenFolderId(folder.id)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FolderIcon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{folder.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {folder.count} {folder.count === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      aria-label="Folder options"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 focus:opacity-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setRenameTarget(folder)}>
                        <Pencil className="h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => void deleteResourceFolder(folder.id).then(refresh)}
                        className="text-destructive focus:bg-destructive/10 [&_svg]:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete folder
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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

          {/* Saved resources (unfiled) */}
          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Saved resources
            </h2>
            {unfiled.length === 0 && (
              <div className="mt-4 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
                <Bookmark className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">No saved resources yet</p>
                <p className="max-w-sm text-xs text-muted-foreground">
                  Bookmark resources from your journeys (the bookmark icon on any resource row)
                  and they&apos;ll collect here.
                </p>
              </div>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {unfiled.map((res) => (
                <SavedResourceCard key={res.id} resource={res} onUnsave={() => handleUnsave(res.id)} />
              ))}
            </div>
          </div>
        </>
      )}

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

      <AddFolderDialog open={dialogOpen} onOpenChange={setDialogOpen} onCreate={handleAddFolder} />

      {/* Folder contents */}
      <Dialog open={!!openFolder} onOpenChange={(o) => !o && setOpenFolderId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <DialogTitle>{openFolder?.name}</DialogTitle>
            <DialogDescription>
              {resourcesInOpenFolder.length === 0
                ? "This folder is empty. Drag saved resources onto the folder to file them here."
                : "Resources in this folder. Remove one to send it back to your saved list."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-2 overflow-y-auto scrollbar-slim">
            {resourcesInOpenFolder.map((res) => (
              <div
                key={res.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ResourceTypeIcon type={res.type} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{res.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {resourceTypeLabel[res.type]} · {res.source}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href={res.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <button
                  onClick={() => void handleRemoveFromFolder(res.id)}
                  aria-label="Remove from folder"
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Rename folder */}
      <RenameFolderDialog
        folder={renameTarget}
        onOpenChange={(o) => !o && setRenameTarget(null)}
        onRename={async (name) => {
          if (renameTarget) {
            await renameResourceFolder(renameTarget.id, name);
            await refresh();
          }
          setRenameTarget(null);
        }}
      />
    </AppPage>
  );
}

function SavedResourceCard({
  resource,
  onUnsave,
}: {
  resource: UiSavedResource;
  onUnsave: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData(DND_KEY, resource.id)}
      className="group flex cursor-grab flex-col rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover active:cursor-grabbing"
    >
      <div className="flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ResourceTypeIcon type={resource.type} className="h-5 w-5" />
        </span>
        <button
          onClick={onUnsave}
          aria-label="Remove from saved resources"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-primary opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        >
          <Bookmark className="h-4 w-4 fill-current" />
        </button>
      </div>
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 line-clamp-2 text-sm font-semibold leading-snug hover:text-primary"
      >
        {resource.title}
      </a>
      <p className="mt-1 text-xs text-muted-foreground">
        {resourceTypeLabel[resource.type]} · {resource.source}
      </p>
      <div className="mt-4 pt-1">
        <Badge variant="muted">{resource.savedFrom}</Badge>
      </div>
    </div>
  );
}

function RenameFolderDialog({
  folder,
  onOpenChange,
  onRename,
}: {
  folder: UiResourceFolder | null;
  onOpenChange: (open: boolean) => void;
  onRename: (name: string) => void;
}) {
  const [name, setName] = useState("");
  useEffect(() => {
    if (folder) setName(folder.name);
  }, [folder]);

  return (
    <Dialog open={!!folder} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Pencil className="h-5 w-5" />
          </div>
          <DialogTitle>Rename folder</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim()) onRename(name.trim());
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="rename-resource-folder">Folder name</Label>
            <Input
              id="rename-resource-folder"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
