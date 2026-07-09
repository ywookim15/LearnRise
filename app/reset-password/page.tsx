"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useApp } from "@/lib/context/app-context";

/**
 * Landing page for the password-recovery email link. The /auth/callback route
 * has already exchanged the link's code for a session by the time the user
 * arrives here, so we just set the new password on the signed-in user.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const { isLoggedIn, authReady } = useApp();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setPending(true);
    const supabase = getSupabaseBrowserClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setDone(true);
  }

  if (!authReady) {
    return (
      <AuthShell title="Set a new password" subtitle="Checking your reset link…">
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
          One moment…
        </div>
      </AuthShell>
    );
  }

  // No session = the recovery link wasn't valid (expired, reused, or opened
  // in a different browser than expected).
  if (!isLoggedIn && !done) {
    return (
      <AuthShell title="Link expired" subtitle="This password reset link is no longer valid.">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <AlertCircle className="mx-auto h-14 w-14 text-destructive" />
          <p className="mt-4 text-sm text-muted-foreground">
            Reset links are single-use and expire quickly. Request a fresh one
            and open it right away.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title="Password updated" subtitle="You're signed in with your new password.">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            All set. Your password has been changed.
          </p>
          <Button className="mt-6 w-full" onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="new">New password</Label>
          <Input
            id="new"
            type="password"
            autoComplete="new-password"
            placeholder="New password (min 6 characters)"
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter new password"
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
