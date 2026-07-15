"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("auth");
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
      setError(t("passwordsDontMatch"));
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
      <AuthShell title={t("setNewTitle")} subtitle={t("checkingSubtitle")}>
        <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
          {t("oneMoment")}
        </div>
      </AuthShell>
    );
  }

  // No session = the recovery link wasn't valid (expired, reused, or opened
  // in a different browser than expected).
  if (!isLoggedIn && !done) {
    return (
      <AuthShell title={t("linkExpiredTitle")} subtitle={t("linkExpiredSubtitle")}>
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <AlertCircle className="mx-auto h-14 w-14 text-destructive" />
          <p className="mt-4 text-sm text-muted-foreground">{t("linkExpiredBody")}</p>
          <Button asChild className="mt-6 w-full">
            <Link href="/forgot-password">{t("requestNewLink")}</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell title={t("passwordUpdatedTitle")} subtitle={t("passwordUpdatedSubtitle")}>
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">{t("passwordUpdatedBody")}</p>
          <Button className="mt-6 w-full" onClick={() => router.push("/dashboard")}>
            {t("goToDashboard")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("setNewTitle")} subtitle={t("setNewSubtitle")}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="new">{t("newPasswordLabel")}</Label>
          <Input
            id="new"
            type="password"
            autoComplete="new-password"
            placeholder={t("newPasswordPlaceholder")}
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">{t("confirmNewLabel")}</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            placeholder={t("confirmNewPlaceholder")}
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("updating") : t("updatePassword")}
        </Button>
      </form>
    </AuthShell>
  );
}
