"use client";

import { useState } from "react";
import { Mail, Instagram, Youtube, CheckCircle2, AlertCircle } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSending(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName: data.get("firstName"),
          lastName: data.get("lastName"),
          email: data.get("email"),
          message: data.get("message"),
          // Honeypot — visually hidden below; real users never fill it.
          company: data.get("company"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Couldn't send your message. Please try again.");
      setSubmitted(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send your message. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <MarketingShell>
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-16 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            We&apos;d love to hear from you
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
            Get in touch
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Questions about your roadmap, feedback on the prototype, or just want
            to say hello? Drop us a line.
          </p>

          <div className="mt-10 space-y-5">
            <ContactRow
              icon={<Mail className="h-5 w-5" />}
              label="Email"
              value="metis.s1x.general@gmail.com"
              href="mailto:metis.s1x.general@gmail.com"
            />
            <ContactRow
              icon={<Instagram className="h-5 w-5" />}
              label="Instagram"
              value="@metis.s1x"
              href="https://www.instagram.com/metis.s1x/"
            />
            <ContactRow
              icon={<Youtube className="h-5 w-5" />}
              label="YouTube"
              value="@METIS.s1x"
              href="https://www.youtube.com/@METIS.s1x"
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-card">
          {submitted ? (
            <div className="flex h-full flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="h-14 w-14 text-primary" />
              <h2 className="mt-4 text-xl font-semibold">Message sent!</h2>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Thanks for reaching out — we&apos;ll get back to you at the email
                you provided.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" name="firstName" placeholder="Maya" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" name="lastName" placeholder="Chen" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your email</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" placeholder="How can we help?" className="min-h-[130px]" required />
              </div>
              {/* Honeypot: hidden from real users (off-screen, not display:none —
                  some bots skip display:none fields), left empty by humans. */}
              <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                <label htmlFor="company">Company</label>
                <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? "Sending…" : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </MarketingShell>
  );
}

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const external = href?.startsWith("http");
  return (
    <div className="flex items-center gap-4">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
        {href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="text-sm font-medium text-foreground hover:text-primary hover:underline"
          >
            {value}
          </a>
        ) : (
          <p className="text-sm font-medium text-foreground">{value}</p>
        )}
      </div>
    </div>
  );
}
