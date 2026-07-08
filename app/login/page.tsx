"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/context/app-context";

export default function LoginPage() {
  const { login } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("maya.chen@example.com");
  const [password, setPassword] = useState("password");

  // Mock auth: flip the boolean and go to the dashboard. No real request.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login();
    router.push("/dashboard");
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to pick up where you left off.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to METIS?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Create an account
        </Link>
      </p>
      <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-center text-xs text-muted-foreground">
        Prototype: any credentials work — submitting just flips a mock
        &ldquo;logged in&rdquo; flag.
      </p>
    </AuthShell>
  );
}
