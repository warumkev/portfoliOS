import { NextResponse } from "next/server";
import { Resend } from "resend";
import { PROFILE } from "@/config/profile";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TO_ADDRESS = "weristkevintamme@gmail.com";
const FROM_ADDRESS = "Portfolio Kontakt <noreply@kevintamme.com>";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function field(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot: real users never see this field.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ message: "OK" }, { status: 200 });
  }

  const name = field(body.name, 120);
  const email = field(body.email, 200);
  const message = field(body.message, 5000);
  if (!name || !email || !message || !EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ message: "Missing or invalid fields" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ message: "Mail service not configured" }, { status: 503 });
  }

  const safe = { name: escapeHtml(name), email: escapeHtml(email), message: escapeHtml(message) };
  const html = `
    <div style="background:#18181b;padding:2rem 0;font-family:Inter,Arial,sans-serif;color:#fafafa;">
      <div style="max-width:480px;margin:0 auto;background:#232323;border-radius:1.25rem;padding:2rem 2.5rem;">
        <h2 style="font-size:1.5rem;font-weight:700;margin:0 0 1.5rem;color:#38bdf8;">Neue Kontaktanfrage</h2>
        <p style="margin:0 0 .75rem;"><strong style="color:#a3e635;">Name:</strong> ${safe.name}</p>
        <p style="margin:0 0 .75rem;"><strong style="color:#a3e635;">E-Mail:</strong> ${safe.email}</p>
        <p style="margin:0 0 .5rem;"><strong style="color:#f472b6;">Nachricht:</strong></p>
        <div style="padding:1rem;background:#18181b;border-radius:.75rem;white-space:pre-line;">${safe.message}</div>
        <p style="margin-top:2rem;font-size:.9rem;color:#a1a1aa;">Kontaktformular · ${PROFILE.links.site.replace("https://", "")}</p>
      </div>
    </div>`;
  const text = `Neue Kontaktanfrage\n\nName: ${name}\nE-Mail: ${email}\n\nNachricht:\n${message}`;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: TO_ADDRESS,
      subject: `Neue Nachricht von ${name}`,
      text,
      html,
      replyTo: email,
    });
    return NextResponse.json({ message: "Nachricht gesendet!" });
  } catch {
    return NextResponse.json({ message: "Fehler beim Senden der Nachricht." }, { status: 500 });
  }
}
