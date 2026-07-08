"use client";

// -----------------------------------------------------------------------------
// MOCK APP STATE — the single source of truth for the whole prototype.
// Everything here lives in React state only (no localStorage, no backend).
// In Phase 2 this gets replaced by real auth + a data layer.
// -----------------------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  mockJourneys,
  createMockJourney,
  type Journey,
  type JourneyCreationInput,
} from "@/lib/mock-data/journeys";
import { mockNotifications, type AppNotification } from "@/lib/mock-data/notifications";
import { mockUser, type MockUser } from "@/lib/mock-data/user";

export interface DashboardFolder {
  id: string;
  name: string;
  journeyIds: string[];
}

interface AppContextValue {
  // Auth (mock boolean)
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;

  // User profile
  user: MockUser;
  updateUser: (patch: Partial<MockUser>) => void;

  // Journeys
  journeys: Journey[];
  getJourney: (id: string) => Journey | undefined;
  addJourney: (input: JourneyCreationInput) => Journey;
  toggleResource: (journeyId: string, resourceId: string) => void;

  // Dashboard folders
  folders: DashboardFolder[];
  addFolder: (name: string) => void;

  // Notifications
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<MockUser>(mockUser);
  const [journeys, setJourneys] = useState<Journey[]>(mockJourneys);
  const [folders, setFolders] = useState<DashboardFolder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

  const login = useCallback(() => setIsLoggedIn(true), []);
  const logout = useCallback(() => setIsLoggedIn(false), []);

  const updateUser = useCallback(
    (patch: Partial<MockUser>) => setUser((u) => ({ ...u, ...patch })),
    []
  );

  const getJourney = useCallback(
    (id: string) => journeys.find((j) => j.id === id),
    [journeys]
  );

  const addJourney = useCallback((input: JourneyCreationInput) => {
    const journey = createMockJourney(input);
    setJourneys((prev) => [...prev, journey]);
    return journey;
  }, []);

  const toggleResource = useCallback((journeyId: string, resourceId: string) => {
    setJourneys((prev) =>
      prev.map((j) => {
        if (j.id !== journeyId) return j;
        return {
          ...j,
          units: j.units.map((u) => ({
            ...u,
            chapters: u.chapters.map((c) => ({
              ...c,
              resources: c.resources.map((res) =>
                res.id === resourceId ? { ...res, completed: !res.completed } : res
              ),
            })),
          })),
        };
      })
    );
  }, []);

  const addFolder = useCallback((name: string) => {
    setFolders((prev) => [
      ...prev,
      { id: `folder-${Date.now()}`, name, journeyIds: [] },
    ]);
  }, []);

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false }))),
    []
  );

  const unreadCount = notifications.filter((n) => n.unread).length;

  const value = useMemo<AppContextValue>(
    () => ({
      isLoggedIn,
      login,
      logout,
      user,
      updateUser,
      journeys,
      getJourney,
      addJourney,
      toggleResource,
      folders,
      addFolder,
      notifications,
      unreadCount,
      markAllRead,
    }),
    [
      isLoggedIn,
      login,
      logout,
      user,
      updateUser,
      journeys,
      getJourney,
      addJourney,
      toggleResource,
      folders,
      addFolder,
      notifications,
      unreadCount,
      markAllRead,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
