"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Upload, Trash2, Sparkles, Check, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { StandaloneShell } from "@/components/layout/standalone-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LanguageSelect } from "@/components/shared/language-select";
import { useApp } from "@/lib/context/app-context";
import { openBillingPortal } from "@/lib/data/subscription";
import { uploadAvatar, removeAvatar, deleteAccount } from "@/lib/data/profile";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DEFAULT_LANGUAGE, getLanguage, normalizeLanguage } from "@/lib/i18n/languages";
import { setLocaleCookie } from "@/lib/i18n/set-locale";

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { user, updateUser, isPremium, subscription, logout } = useApp();
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [langSaved, setLangSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [billingPending, setBillingPending] = useState(false);
  const [billingError, setBillingError] = useState<string | null>(null);

  // Avatar upload/remove
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPending, setAvatarPending] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setAvatarError(null);
    setAvatarPending(true);
    try {
      await uploadAvatar(file); // updates auth metadata -> context refreshes
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : t("uploadFailed"));
    } finally {
      setAvatarPending(false);
    }
  }

  async function handleAvatarRemove() {
    setAvatarError(null);
    setAvatarPending(true);
    try {
      await removeAvatar();
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : t("removeFailed"));
    } finally {
      setAvatarPending(false);
    }
  }

  // Delete account (password-confirmed)
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePending, setDeletePending] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteError(null);
    setDeletePending(true);
    try {
      await deleteAccount(deletePassword);
      await logout();
      router.push("/");
      router.refresh();
    } catch (err) {
      setDeletePending(false);
      setDeleteError(err instanceof Error ? err.message : t("deleteAccountError"));
    }
  }

  const hasCustomAvatar = !user.avatarUrl.startsWith("data:");

  async function handleManageBilling() {
    setBillingError(null);
    setBillingPending(true);
    try {
      await openBillingPortal(); // redirects to Stripe on success
    } catch (e) {
      setBillingPending(false);
      setBillingError(e instanceof Error ? e.message : t("billingError"));
    }
  }

  // The Supabase session loads asynchronously, re-seed the form when the
  // real profile arrives (or after a save round-trips through the context).
  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
  }, [user.firstName, user.lastName, user.email]);

  // Load the saved learning language from auth metadata once the session is up.
  useEffect(() => {
    getSupabaseBrowserClient()
      .auth.getSession()
      .then(({ data }) => {
        const code = (data.session?.user.user_metadata as Record<string, unknown> | undefined)
          ?.learning_language;
        if (typeof code === "string") setLanguage(normalizeLanguage(code));
      });
  }, []);

  async function handleLanguageChange(code: string) {
    setLanguage(code);
    // One choice drives BOTH the interface locale and the AI/learning language.
    setLocaleCookie(code);
    await getSupabaseBrowserClient().auth.updateUser({ data: { learning_language: code } });
    setLangSaved(true);
    router.refresh(); // re-render server components in the new locale
    setTimeout(() => setLangSaved(false), 2000);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Persists name (user_metadata) and email to Supabase Auth via the context.
    updateUser({ firstName, lastName, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`;

  return (
    <StandaloneShell>
      <h1 className="font-serif text-3xl tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("subtitle")}
      </p>

      {/* Profile picture */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("profilePicture")}
        </h2>
        <div className="mt-4 flex items-center gap-5">
          <Avatar className="h-20 w-20 ring-2 ring-border">
            <AvatarImage src={user.avatarUrl} alt="Profile" />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={handleAvatarFile}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarPending}
              >
                {avatarPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {t("uploadNew")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={handleAvatarRemove}
                disabled={avatarPending || !hasCustomAvatar}
              >
                <Trash2 className="h-4 w-4" />
                {t("remove")}
              </Button>
            </div>
            {avatarError ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {avatarError}
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">{t("avatarHint")}</p>
            )}
          </div>
        </div>
      </section>

      {/* Account details */}
      <form
        onSubmit={handleSave}
        className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {t("accountDetails")}
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t("firstName")}</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t("lastName")}</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">{t("emailLabel")}</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{t("passwordLabel")}</Label>
            <p className="text-sm text-muted-foreground">
              {t.rich("passwordHelp", {
                link: (chunks) => (
                  <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button type="submit">{t("saveChanges")}</Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              {t("saved")}
            </span>
          )}
        </div>
      </form>

      {/* Learning language */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {t("learningLanguage")}
          </h2>
          {langSaved && (
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              {t("saved")}
            </span>
          )}
        </div>
        <div className="mt-4 max-w-sm">
          <LanguageSelect id="learning-language" value={language} onChange={handleLanguageChange} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {t.rich("languageHelp", {
            lang: getLanguage(language).nativeName,
            b: (chunks) => <span className="font-medium text-foreground">{chunks}</span>,
          })}
        </p>
      </section>

      {/* Plan */}
      <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-brand-gradient-soft p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">{t("yourPlan")}</h2>
          <p className="text-sm text-muted-foreground">
            {isPremium ? t("planStatusPremium") : t("planStatusFree")}
          </p>
          {billingError && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-destructive">
              <AlertCircle className="h-3.5 w-3.5" />
              {billingError}
            </p>
          )}
        </div>
        {isPremium || subscription?.hasCustomer ? (
          <Button variant="outline" onClick={handleManageBilling} disabled={billingPending}>
            {billingPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {t("manageBilling")}
          </Button>
        ) : (
          <Button asChild variant="gradient">
            <Link href="/upgrade">
              <Sparkles className="h-4 w-4" />
              {t("upgradeMyPlan")}
            </Link>
          </Button>
        )}
      </section>

      {/* Danger zone */}
      <section className="mt-6 rounded-2xl border border-destructive/30 bg-card p-6 shadow-card">
        <h2 className="text-base font-semibold text-destructive">{t("dangerZone")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("dangerDesc")}
        </p>
        <Button
          variant="outline"
          className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          {t("deleteAccount")}
        </Button>
      </section>

      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => {
          if (deletePending) return;
          setDeleteOpen(o);
          if (!o) {
            setDeletePassword("");
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteDesc")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password">{t("passwordLabel")}</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                placeholder={t("passwordPlaceholder")}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />
            </div>
            {deleteError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {deleteError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDeleteOpen(false)} disabled={deletePending}>
                {t("cancel")}
              </Button>
              <Button type="submit" variant="destructive" disabled={deletePending || !deletePassword}>
                {deletePending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("deleteAccount")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </StandaloneShell>
  );
}
