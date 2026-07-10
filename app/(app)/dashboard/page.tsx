"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Folder as FolderIcon,
  FolderPlus,
  FolderOpen,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { AppPage } from "@/components/layout/app-page";
import { JourneyCard } from "@/components/dashboard/journey-card";
import { AddJourneyCard } from "@/components/dashboard/add-journey-card";
import { HelpDialog } from "@/components/dashboard/help-dialog";
import { AddFolderDialog } from "@/components/dashboard/add-folder-dialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/context/app-context";
import type { DashboardFolder } from "@/lib/context/app-context";
import { cn } from "@/lib/utils";

const DND_KEY = "text/metis-journey-id";

export default function DashboardPage() {
  const {
    journeys,
    journeysLoading,
    journeysError,
    refreshJourneys,
    folders,
    addFolder,
    renameFolder,
    deleteFolder,
    addJourneyToFolder,
    removeJourneyFromFolder,
  } = useApp();
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [openFolderId, setOpenFolderId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<DashboardFolder | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);

  useEffect(() => {
    void refreshJourneys();
  }, [refreshJourneys]);

  // Journeys not filed in any folder show in the main grid (Drive-style).
  const filedIds = new Set(folders.flatMap((f) => f.journeyIds));
  const unfiled = journeys.filter((j) => !filedIds.has(j.id));
  const openFolder = folders.find((f) => f.id === openFolderId) ?? null;
  const journeysInOpenFolder = openFolder
    ? openFolder.journeyIds
        .map((id) => journeys.find((j) => j.id === id))
        .filter((j): j is NonNullable<typeof j> => !!j)
    : [];

  function handleDropOnFolder(e: React.DragEvent, folderId: string) {
    e.preventDefault();
    const journeyId = e.dataTransfer.getData(DND_KEY);
    if (journeyId) addJourneyToFolder(folderId, journeyId);
    setDragOverFolder(null);
  }

  return (
    <AppPage showMemoryAgent={false}>
      <div>
        <h1 className="text-4xl font-bold tracking-tight">My Learning Journeys</h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Precision-mapped pathways across your professional and intellectual
          landscape.
          {folders.length > 0 && " Drag a journey card onto a folder to file it."}
        </p>
      </div>

      {journeysError ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">Couldn&apos;t load your journeys: {journeysError}</p>
          <Button variant="outline" size="sm" onClick={() => refreshJourneys()}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {journeysLoading && journeys.length === 0
            ? Array.from({ length: 3 }).map((_, i) => <JourneyCardSkeleton key={i} />)
            : unfiled.map((journey) => (
                <div
                  key={journey.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData(DND_KEY, journey.id)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <JourneyCard journey={journey} />
                </div>
              ))}
          <AddJourneyCard />
        </div>
      )}

      {/* Folders */}
      {folders.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Folders
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverFolder(folder.id);
                }}
                onDragLeave={() => setDragOverFolder((cur) => (cur === folder.id ? null : cur))}
                onDrop={(e) => handleDropOnFolder(e, folder.id)}
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
                      {folder.journeyIds.length}{" "}
                      {folder.journeyIds.length === 1 ? "journey" : "journeys"}
                    </p>
                  </div>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 focus:opacity-100">
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setRenameTarget(folder)}>
                      <Pencil className="h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => deleteFolder(folder.id)}
                      className="text-destructive focus:bg-destructive/10 [&_svg]:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating actions */}
      <div className="fixed bottom-6 right-6 z-20 flex items-center gap-3">
        <HelpDialog />
        <Button
          variant="gradient"
          className="h-11 rounded-full px-5 shadow-brand"
          onClick={() => setFolderDialogOpen(true)}
        >
          <FolderPlus className="h-4 w-4" />
          Add Folder
        </Button>
      </div>

      <AddFolderDialog
        open={folderDialogOpen}
        onOpenChange={setFolderDialogOpen}
        onCreate={addFolder}
      />

      {/* Folder contents */}
      <Dialog open={!!openFolder} onOpenChange={(o) => !o && setOpenFolderId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderOpen className="h-5 w-5" />
            </div>
            <DialogTitle>{openFolder?.name}</DialogTitle>
            <DialogDescription>
              {journeysInOpenFolder.length === 0
                ? "This folder is empty. Drag journey cards onto the folder to file them here."
                : "Journeys in this folder. Remove one to send it back to your dashboard."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-2 overflow-y-auto scrollbar-slim">
            {journeysInOpenFolder.map((j) => (
              <div
                key={j.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{j.name}</p>
                  <p className="text-xs text-muted-foreground">{j.progress}% complete</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/journey/${j.id}`}>Resume</Link>
                </Button>
                <button
                  onClick={() => openFolder && removeJourneyFromFolder(openFolder.id, j.id)}
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
        onRename={(name) => {
          if (renameTarget) renameFolder(renameTarget.id, name);
          setRenameTarget(null);
        }}
      />
    </AppPage>
  );
}

function RenameFolderDialog({
  folder,
  onOpenChange,
  onRename,
}: {
  folder: DashboardFolder | null;
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
            <Label htmlFor="rename-folder">Folder name</Label>
            <Input
              id="rename-folder"
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

function JourneyCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="h-11 w-11 animate-pulse rounded-xl bg-muted" />
      <div className="mt-4 h-5 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-muted" />
      <div className="mt-5 h-2 w-full animate-pulse rounded-full bg-muted" />
      <div className="mt-4 flex gap-2">
        <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
        <div className="h-10 flex-1 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}
