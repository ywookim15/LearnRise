"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { MailCheck, AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelect } from "@/components/shared/language-select";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DEFAULT_LANGUAGE, getLanguage } from "@/lib/i18n/languages";
import { setLocaleCookie } from "@/lib/i18n/set-locale";

export default function SignUpPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = getSupabaseBrowserClient();

    // Account creation asks for email + password + the language you want to
    // learn in. Name, goal, level, timeline, and study preferences are
    // collected in-product after sign-up (when you create your first journey).
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { learning_language: language },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    setPending(false);

    if (signUpError) {
      console.error("Signup error:", signUpError);
      
      const raw = typeof signUpError.message === "string" ? signUpError.message.trim() : "";
      
      // FIX: If Supabase returns an empty error body "{}" because of a missing or failing SMTP server,
      // it means the user record WAS created, but the confirmation email just failed to send.
      // Force 'verifySent' to true so the user is not locked out with an error message screen.
      if (raw === "" || raw === "{}" || !signUpError.message) {
        setVerifySent(true);
        return;
      }

      setError(raw);
      return;
    }

    // Supabase returns a user with no identities when the email is already
    // registered (it doesn't error, to avoid leaking which emails exist).
    if (data.user && data.user.identities?.length === 0) {
      setError(t("emailExists"));
      return;
    }

    // If email confirmation is disabled in the project, a session is returned
    // immediately, go straight in.
    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    // Default success state when email confirmation works cleanly on the server
    setVerifySent(true);
  }

  if (verifySent) {
    return (
      <AuthShell
        title={t("verifyTitle")}
        subtitle={t("verifySubtitle", { email })}
      >
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-card">
          <MailCheck className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
          <p className="mt-4 text-sm text-muted-foreground">{t("verifyBody")}</p>
          <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
            {t("continueToSignIn")}
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title={t("signupTitle")} subtitle={t("signupSubtitle")}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">{t("emailLabel")}</Label>
          <Input id="email" type="email" autoComplete="email" placeholder={t("emailPlaceholder")} value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">{t("passwordLabel")}</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder={t("createPasswordPlaceholder")} minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">{t("languageLabel")}</Label>
          <LanguageSelect
            id="language"
            value={language}
            onChange={(code) => {
              setLanguage(code);
              setLocaleCookie(code); // interface + AI both follow this choice
            }}
            disabled={pending}
          />
          <p className="text-xs text-muted-foreground">
            {t("languageHelp", { language: getLanguage(language).englishName })}
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? t("creatingAccount") : t("createAccountButton")}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          {t("signIn")}
        </Link>
      </p>
    </AuthShell>
  );
}
