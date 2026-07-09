"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { useApp } from "@/lib/context/app-context";
import { openBillingPortal } from "@/lib/data/subscription";
import { uploadAvatar, removeAvatar, deleteAccount } from "@/lib/data/profile";

export default function SettingsPage() {
  const { user, updateUser, isPremium, subscription, logout } = useApp();
  const router = useRouter();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
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
      setAvatarError(err instanceof Error ? err.message : "Upload failed.");
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
      setAvatarError(err instanceof Error ? err.message : "Couldn't remove picture.");
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
      setDeleteError(err instanceof Error ? err.message : "Couldn't delete account.");
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
      setBillingError(e instanceof Error ? e.message : "Couldn't open billing portal.");
    }
  }

  // The Supabase session loads asynchronously — re-seed the form when the
  // real profile arrives (or after a save round-trips through the context).
  useEffect(() => {
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEmail(user.email);
  }, [user.firstName, user.lastName, user.email]);

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
      <h1 className="font-serif text-3xl tracking-tight">Profile &amp; Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your account. Name and email changes are saved to your METIS
        account (email changes require confirmation via inbox link).
      </p>

      {/* Profile picture */}
      <section className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Profile picture
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
                Upload new
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={handleAvatarRemove}
                disabled={avatarPending || !hasCustomAvatar}
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            </div>
            {avatarError ? (
              <p className="mt-2 flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />
                {avatarError}
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">PNG, JPG, WEBP or GIF · up to 3 MB.</p>
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
          Account details
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>Password</Label>
            <p className="text-sm text-muted-foreground">
              To change your password, use the{" "}
              <Link href="/forgot-password" className="font-medium text-primary hover:underline">
                password reset flow
              </Link>
              {" "}— we&apos;ll email you a secure link.
            </p>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button type="submit">Save changes</Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </form>

      {/* Plan */}
      <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-brand-gradient-soft p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Your plan</h2>
          <p className="text-sm text-muted-foreground">
            You&apos;re currently on the {isPremium ? "Premium" : "Free"} plan.
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
            Manage billing
          </Button>
        ) : (
          <Button asChild variant="gradient">
            <Link href="/upgrade">
              <Sparkles className="h-4 w-4" />
              Upgrade my plan
            </Link>
          </Button>
        )}
      </section>

      {/* Danger zone */}
      <section className="mt-6 rounded-2xl border border-destructive/30 bg-card p-6 shadow-card">
        <h2 className="text-base font-semibold text-destructive">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account and all associated data.
        </p>
        <Button
          variant="outline"
          className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/10"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
          Delete account
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
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This permanently deletes your account, journeys, and progress. This
              can&apos;t be undone. Enter your password to confirm.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="delete-password">Password</Label>
              <Input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
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
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={deletePending || !deletePassword}>
                {deletePending && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete account
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </StandaloneShell>
  );
}
