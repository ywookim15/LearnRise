"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useApp } from "@/lib/context/app-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, authReady } = useApp();
  const router = useRouter();

  // Middleware already blocks these routes server-side; this client guard is
  // the UX layer that reacts to in-tab auth changes (e.g. sign-out).
  useEffect(() => {
    if (authReady && !isLoggedIn) router.replace("/login");
  }, [authReady, isLoggedIn, router]);

  if (!authReady || !isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading your session…
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      {children}
    </div>
  );
}
