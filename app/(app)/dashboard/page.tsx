"use client";

import { useEffect, useState } from "react";
import { Folder as FolderIcon, FolderPlus, AlertCircle, RefreshCw } from "lucide-react";
import { AppPage } from "@/components/layout/app-page";
import { JourneyCard } from "@/components/dashboard/journey-card";
import { AddJourneyCard } from "@/components/dashboard/add-journey-card";
import { StreakWidget } from "@/components/dashboard/streak-widget";
import { HelpDialog } from "@/components/dashboard/help-dialog";
import { AddFolderDialog } from "@/components/dashboard/add-folder-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/context/app-context";
import type { DashboardFolder } from "@/lib/context/app-context";

export default function DashboardPage() {
  const {
    journeys,
    journeysLoading,
    journeysError,
    refreshJourneys,
    folders,
    addFolder,
  } = useApp();
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [openFolder, setOpenFolder] = useState<DashboardFolder | null>(null);

  // Re-fetch when returning to the dashboard (curation may have progressed).
  useEffect(() => {
    void refreshJourneys();
  }, [refreshJourneys]);

  return (
    <AppPage showMemoryAgent={false}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">My Learning Journeys</h1>
          <p className="mt-2 max-w-md text-muted-foreground">
            Precision-mapped pathways across your professional and intellectual
            landscape.
          </p>
        </div>
        <StreakWidget />
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
            : journeys.map((journey) => <JourneyCard key={journey.id} journey={journey} />)}
          <AddJourneyCard />
        </div>
      )}

      {folders.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Folders
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setOpenFolder(folder)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-card transition-shadow hover:shadow-card-hover"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FolderIcon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{folder.name}</p>
                  <p className="text-xs text-muted-foreground">{folder.journeyIds.length} journeys</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

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

      <Dialog open={!!openFolder} onOpenChange={(o) => !o && setOpenFolder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FolderIcon className="h-5 w-5" />
            </div>
            <DialogTitle>{openFolder?.name}</DialogTitle>
            <DialogDescription>
              This folder is empty. In a future version you&apos;ll be able to drag
              journeys here to organize them.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </AppPage>
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
