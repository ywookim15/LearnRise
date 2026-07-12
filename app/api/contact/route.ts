import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_PER_DAY = 5;
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

interface ContactBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  message?: string;
  // Honeypot: a field real users never see or fill. Any value here means bot.
  company?: string;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/**
 * POST /api/contact — public contact form submission. Validates input,
 * rejects bots via a honeypot field, rate-limits by IP (via contact_submissions,
 * migration 0007), then emails the team through Resend with reply-to set to
 * the submitter so a reply goes straight to them.
 */
export async function POST(req: NextRequest) {
  let body: ContactBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Honeypot — a bot filling every field will fill this one too; a human never
  // sees it (visually hidden in the form). Pretend success so bots don't learn.
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const firstName = (body.firstName ?? "").trim();
  const lastName = (body.lastName ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();

  if (!firstName || !lastName || !email || !message) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: "Message is too long." }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  const ip = clientIp(req);

  // ---- rate limit: N submissions per IP per rolling 24h ----
  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count } = await admin
    .from("contact_submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since);
  if ((count ?? 0) >= RATE_LIMIT_PER_DAY) {
    return NextResponse.json(
      { error: "Too many messages sent from this connection today. Please try again tomorrow." },
      { status: 429 }
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || "metis.s1x.general@gmail.com";
  if (!resendKey) {
    console.error("[contact] RESEND_API_KEY not configured");
    return NextResponse.json({ error: "Contact form is not configured." }, { status: 500 });
  }

  const fullName = `${firstName} ${lastName}`.trim();

  try {
    const resend = new Resend(resendKey);
    const { error: sendError } = await resend.emails.send({
      from: "METIS Contact Form <contact@metis6.com>",
      to: toEmail,
      replyTo: email,
      subject: `New contact form message from ${fullName}`,
      text: `From: ${fullName} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${escapeHtml(fullName)} &lt;${escapeHtml(email)}&gt;</p><p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>`,
    });
    if (sendError) {
      console.error("[contact] Resend send failed:", sendError);
      return NextResponse.json({ error: "Couldn't send your message. Please try again." }, { status: 502 });
    }
  } catch (err) {
    console.error("[contact] Resend send threw:", err);
    return NextResponse.json({ error: "Couldn't send your message. Please try again." }, { status: 502 });
  }

  // Record after a successful send — both the audit log and the rate-limit source.
  await admin.from("contact_submissions").insert({ name: fullName, email, message, ip });

  return NextResponse.json({ ok: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
