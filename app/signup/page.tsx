"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const router = useRouter();
  const [verifySent, setVerifySent] = useState(false);

  // Mock sign up: show a "verify your email" placeholder, no real account.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setVerifySent(true);
  }

  if (verifySent) {
    return (
      <AuthShell
        title="Verify your email"
        subtitle="We sent a confirmation link to your inbox."
      >
        <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
          <MailCheck className="mx-auto h-14 w-14 text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            This is a mock screen — no email was actually sent. In the real app
            you&apos;d click the link in your inbox to activate your account.
          </p>
          <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
            Continue to sign in
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="Start your first learning journey — free.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Maya Chen" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Create a password" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input id="confirm" type="password" placeholder="Re-enter your password" required />
        </div>
        <Button type="submit" className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
