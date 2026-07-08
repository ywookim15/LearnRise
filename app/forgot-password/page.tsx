"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = "request" | "sent" | "reset" | "done";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");

  if (step === "request") {
    return (
      <AuthShell title="Reset your password" subtitle="Enter your email and we'll send reset instructions.">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep("sent");
          }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" required />
          </div>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthShell>
    );
  }

  if (step === "sent") {
    return (
      <AuthShell title="Check your email" subtitle="We sent a password reset link.">
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <MailCheck className="mx-auto h-14 w-14 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Mock screen — no email was sent. Click below to simulate opening the
            reset link from your inbox.
          </p>
          <Button className="mt-6 w-full" onClick={() => setStep("reset")}>
            Open reset link
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (step === "reset") {
    return (
      <AuthShell title="Set a new password" subtitle="Choose a new password for your account.">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep("done");
          }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="maya.chen@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" placeholder="New password" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" type="password" placeholder="Re-enter new password" required />
          </div>
          <Button type="submit" className="w-full">
            Update password
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Password updated" subtitle="You can now sign in with your new password.">
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
        <CheckCircle2 className="mx-auto h-14 w-14 text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">
          Mock confirmation — nothing was actually changed.
        </p>
        <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
          Back to sign in
        </Button>
      </div>
    </AuthShell>
  );
}
