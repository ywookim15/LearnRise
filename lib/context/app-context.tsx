"use client";

// -----------------------------------------------------------------------------
// APP STATE — Phase 2.
//
// REAL: Supabase auth session + user profile; journey list/creation (Step 5,
//   backed by lib/data/journeys via Supabase).
// STILL MOCK: folders + notifications (out of the Step 5 scope; wired later).
// -----------------------------------------------------------------------------

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { makeInitialsAvatar } from "@/lib/avatar";
import {
  listJourneySummaries,
  createJourney as createJourneyRequest,
  type UiJourneySummary,
  type CreateJourneyInput,
} from "@/lib/data/journeys";
import { getMySubscription, type UiSubscription } from "@/lib/data/subscription";
import { mockNotifications, type AppNotification } from "@/lib/mock-data/notifications";
import type { MockUser } from "@/lib/mock-data/user";

export interface DashboardFolder {
  id: string;
  name: string;
  journeyIds: string[];
}

interface AppContextValue {
  // Auth
  isLoggedIn: boolean;
  authReady: boolean;
  logout: () => Promise<void>;

  // User profile
  user: MockUser;
  updateUser: (patch: Partial<MockUser>) => void;

  // Billing (real, from Supabase subscriptions synced by the Stripe webhook)
  subscription: UiSubscription | null;
  isPremium: boolean;
  refreshSubscription: () => Promise<void>;

  // Journeys (real, from Supabase)
  journeys: UiJourneySummary[];
  journeysLoading: boolean;
  journeysError: string | null;
  refreshJourneys: () => Promise<void>;
  createJourney: (input: CreateJourneyInput) => Promise<string>;

  // Dashboard folders — MOCK
  folders: DashboardFolder[];
  addFolder: (name: string) => void;

  // Notifications — MOCK
  notifications: AppNotification[];
  unreadCount: number;
  markAllRead: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function profileFromAuthUser(u: SupabaseUser | null): {
  firstName: string;
  lastName: string;
  email: string;
} {
  if (!u) return { firstName: "", lastName: "", email: "" };
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const full = typeof meta.full_name === "string" ? meta.full_name.trim() : "";
  const first =
    (typeof meta.first_name === "string" && meta.first_name) ||
    (full ? full.split(/\s+/)[0] : "") ||
    (u.email ? u.email.split("@")[0] : "Learner");
  const last =
    (typeof meta.last_name === "string" && meta.last_name) ||
    (full ? full.split(/\s+/).slice(1).join(" ") : "");
  return { firstName: first, lastName: last, email: u.email ?? "" };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  // --- auth ---
  const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [profileOverride, setProfileOverride] = useState<Partial<MockUser>>({});
  const [subscription, setSubscription] = useState<UiSubscription | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAuthUser(data.session?.user ?? null);
      setAuthReady(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAuthReady(true);
      if (!session) {
        setProfileOverride({});
        setSubscription(null);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
  }, [supabase]);

  const user = useMemo<MockUser>(() => {
    const base = profileFromAuthUser(authUser);
    const firstName = profileOverride.firstName ?? base.firstName;
    const lastName = profileOverride.lastName ?? base.lastName;
    const email = profileOverride.email ?? base.email;
    const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}` || firstName.slice(0, 2);
    return {
      firstName,
      lastName,
      email,
      avatarUrl: makeInitialsAvatar(initials),
      // Real plan: 'pro' badge iff an active Stripe subscription entitles them.
      plan: subscription?.isPremium ? "pro" : "free",
    };
  }, [authUser, profileOverride, subscription]);

  const updateUser = useCallback(
    (patch: Partial<MockUser>) => {
      setProfileOverride((prev) => ({ ...prev, ...patch }));
      const attrs: { email?: string; data?: Record<string, string> } = {};
      if (patch.email && patch.email !== user.email) attrs.email = patch.email;
      if (patch.firstName !== undefined || patch.lastName !== undefined) {
        const first = patch.firstName ?? user.firstName;
        const last = patch.lastName ?? user.lastName;
        attrs.data = {
          first_name: first,
          last_name: last,
          full_name: `${first} ${last}`.trim(),
        };
      }
      if (attrs.email || attrs.data) void supabase.auth.updateUser(attrs);
    },
    [supabase, user.email, user.firstName, user.lastName]
  );

  // --- journeys (real) ---
  const [journeys, setJourneys] = useState<UiJourneySummary[]>([]);
  const [journeysLoading, setJourneysLoading] = useState(false);
  const [journeysError, setJourneysError] = useState<string | null>(null);

  const refreshJourneys = useCallback(async () => {
    setJourneysLoading(true);
    setJourneysError(null);
    try {
      setJourneys(await listJourneySummaries());
    } catch (err) {
      setJourneysError(err instanceof Error ? err.message : "Failed to load journeys");
    } finally {
      setJourneysLoading(false);
    }
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      setSubscription(await getMySubscription());
    } catch {
      setSubscription(null);
    }
  }, []);

  // Load journeys + subscription once authenticated; clear on sign-out.
  useEffect(() => {
    if (authReady && authUser) {
      void refreshJourneys();
      void refreshSubscription();
    }
    if (authReady && !authUser) {
      setJourneys([]);
      setJourneysError(null);
      setSubscription(null);
    }
  }, [authReady, authUser, refreshJourneys, refreshSubscription]);

  const createJourney = useCallback(
    async (input: CreateJourneyInput) => {
      const id = await createJourneyRequest(input);
      await refreshJourneys();
      return id;
    },
    [refreshJourneys]
  );

  // --- folders / notifications: MOCK ---
  const [folders, setFolders] = useState<DashboardFolder[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(mockNotifications);

  const addFolder = useCallback((name: string) => {
    setFolders((prev) => [...prev, { id: `folder-${Date.now()}`, name, journeyIds: [] }]);
  }, []);

  const markAllRead = useCallback(
    () => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false }))),
    []
  );
  const unreadCount = notifications.filter((n) => n.unread).length;

  const value = useMemo<AppContextValue>(
    () => ({
      isLoggedIn: !!authUser,
      authReady,
      logout,
      user,
      updateUser,
      subscription,
      isPremium: !!subscription?.isPremium,
      refreshSubscription,
      journeys,
      journeysLoading,
      journeysError,
      refreshJourneys,
      createJourney,
      folders,
      addFolder,
      notifications,
      unreadCount,
      markAllRead,
    }),
    [
      authUser,
      authReady,
      logout,
      user,
      updateUser,
      subscription,
      refreshSubscription,
      journeys,
      journeysLoading,
      journeysError,
      refreshJourneys,
      createJourney,
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
