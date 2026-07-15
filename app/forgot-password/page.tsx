"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { MailCheck, AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = getSupabaseBrowserClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });
    setPending(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell title={t("resetSentTitle")} subtitle={t("resetSentSubtitle", { email })}>
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <MailCheck className="mx-auto h-14 w-14 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">{t("resetSentBody")}</p>
          <Button asChild variant="outline" className="mt-6 w-full">
            <Link href="/login">{t("backToSignIn")}</Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("forgotTitle")} subtitle={t("forgotSubtitle")}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("sending") : t("sendResetLink")}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("rememberedIt")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("backToSignIn")}
        </Link>
      </p>
    </AuthShell>
  );
}
