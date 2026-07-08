"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useApp } from "@/lib/context/app-context";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useApp();
  const router = useRouter();

  // Mock auth guard: bounce to the login shell when the mock session is off.
  useEffect(() => {
    if (!isLoggedIn) router.replace("/login");
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Redirecting to sign in…
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
