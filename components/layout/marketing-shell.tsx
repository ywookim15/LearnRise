import type { ReactNode } from "react";
import Link from "next/link";
import { Instagram, Youtube } from "lucide-react";
import { useTranslations } from "next-intl";
import { MarketingNav } from "@/components/layout/marketing-nav";
import { Logo } from "@/components/shared/logo";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}

const SOCIALS = [
  { href: "https://www.instagram.com/metis.s1x/", label: "Instagram", icon: Instagram },
  { href: "https://www.youtube.com/@METIS.s1x", label: "YouTube", icon: Youtube },
];

function MarketingFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("tagline")}
          </p>
          <div className="flex items-center gap-2 pt-1">
            {SOCIALS.map(({ href, label, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          title={t("product")}
          links={[
            { href: "/about", label: nav("about") },
            { href: "/pricing", label: nav("pricing") },
            { href: "/contact", label: nav("contact") },
          ]}
        />
        <FooterCol
          title={t("account")}
          links={[
            { href: "/login", label: nav("signIn") },
            { href: "/signup", label: nav("getStarted") },
          ]}
        />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-foreground">{t("privacy")}</Link>
            <Link href="/about" className="hover:text-foreground">{t("terms")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-primary">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
