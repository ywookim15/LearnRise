"use client";

import { useState } from "react";
import { Mail, Instagram, Youtube, CheckCircle2 } from "lucide-react";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  // Mock only — no network. Just flips to a local success state.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
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
                Thanks for reaching out. This is a mock confirmation — no message
                was actually delivered in the prototype.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
                Send another
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" placeholder="Maya" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" placeholder="Chen" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your email</Label>
                <Input id="email" type="email" placeholder="you@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="How can we help?" className="min-h-[130px]" required />
              </div>
              <Button type="submit" className="w-full">
                Send message
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
