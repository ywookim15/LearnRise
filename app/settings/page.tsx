"use client";

import { useState } from "react";
import Link from "next/link";
import { Upload, Trash2, Sparkles, Check } from "lucide-react";
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

export default function SettingsPage() {
  const { user, updateUser } = useApp();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [saved, setSaved] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    // Mock save — updates the in-memory user so the topbar avatar reflects it.
    updateUser({ firstName, lastName, email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`;

  return (
    <StandaloneShell>
      <h1 className="font-serif text-3xl tracking-tight">Profile &amp; Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your account. (All fields are mock UI — nothing is persisted.)
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
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4" />
              Upload new
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
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
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" defaultValue="password123" />
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Button type="submit">Save changes</Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
              <Check className="h-4 w-4" />
              Saved (mock)
            </span>
          )}
        </div>
      </form>

      {/* Plan */}
      <section className="mt-6 flex flex-col gap-4 rounded-2xl border border-border bg-brand-gradient-soft p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold">Your plan</h2>
          <p className="text-sm text-muted-foreground">
            You&apos;re currently on the {user.plan === "pro" ? "Premium" : "Free"} plan.
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link href="/upgrade">
            <Sparkles className="h-4 w-4" />
            Upgrade my plan
          </Link>
        </Button>
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

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="h-5 w-5" />
            </div>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              This would permanently delete your account, journeys, and progress.
              This action can&apos;t be undone. (Non-functional in this prototype.)
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setDeleteOpen(false)}>
              Delete account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </StandaloneShell>
  );
}
