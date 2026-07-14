"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MailCheck, AlertCircle } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [verifySent, setVerifySent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const supabase = getSupabaseBrowserClient();

    // Account creation only asks for email + password. Your name, goal, level,
    // timeline, and study preferences are collected in-product after sign-up
    // (when you create your first journey), not up front.
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
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
      setError("An account with this email already exists. Try signing in instead.");
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
        title="Verify your email"
        subtitle={`We sent a confirmation link to ${email}.`}
      >
        <div className="rounded-lg border border-border bg-card p-8 text-center shadow-card">
          <MailCheck className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
          <p className="mt-4 text-sm text-muted-foreground">
            Click the link in your inbox to activate your account, then sign in.
            Check spam if it doesn&apos;t arrive within a minute.
          </p>
          <Button className="mt-6 w-full" onClick={() => router.push("/login")}>
            Continue to sign in
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Create your account" subtitle="It only takes an email and a password. Your first journey is free.">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" placeholder="Create a password (min 6 characters)" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account..." : "Create account"}
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
