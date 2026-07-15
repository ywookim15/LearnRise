"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Surface auth-callback failures (e.g. expired email link) without needing
  // useSearchParams/Suspense.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "auth_callback_failed") {
      setError(t("linkInvalid"));
    }
  }, [t]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const supabase = getSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setPending(false);
      setError(
        signInError.message === "Invalid login credentials"
          ? t("incorrectCredentials")
          : signInError.message
      );
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthShell title={t("loginTitle")} subtitle={t("loginSubtitle")}>
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("passwordLabel")}</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              {t("forgotPassword")}
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("signingIn") : t("signIn")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("newToMetis")}{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          {t("createAccount")}
        </Link>
      </p>
    </AuthShell>
  );
}
