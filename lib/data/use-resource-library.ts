"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listSavedResources,
  listResourceFolders,
  type UiSavedResource,
  type UiResourceFolder,
} from "@/lib/data/resource-library";

/** Loads saved resources + their folders together (the Resources page needs both). */
export function useResourceLibrary() {
  const [resources, setResources] = useState<UiSavedResource[]>([]);
  const [folders, setFolders] = useState<UiResourceFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [r, f] = await Promise.all([listSavedResources(), listResourceFolders()]);
      setResources(r);
      setFolders(f);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your resources");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { resources, folders, loading, error, refresh: load };
}
