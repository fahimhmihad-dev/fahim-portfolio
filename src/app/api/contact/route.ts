import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createPublicClient } from "@/lib/supabase/server";
import { checkRateLimit, extractClientIp, hashIp } from "@/lib/rate-limit";
import { getPublicProfile } from "@/lib/data";

const contactSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(120),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000),
  // Honeypot field: must remain blank
  website: z.string().max(0).optional().default(""),
  // Anti-bot timing token (ms since form mounted)
  startedAt: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Silent accept if honeypot filled (don't help bots debug)
    if (typeof body?.website === "string" && body.website.trim().length > 0) {
      return NextResponse.json({ ok: true, id: "accepted" });
    }

    // Reject impossible sub-second bot submissions
    if (typeof body?.startedAt === "number" && Date.now() - body.startedAt < 1000) {
      return NextResponse.json(
        { error: "Please take a moment before submitting your message." },
        { status: 429 }
      );
    }

    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid form data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const ipHash = hashIp(extractClientIp(req.headers));
    const rate = await checkRateLimit(`contact:${ipHash}`, 5, 600);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many messages sent recently. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
      );
    }

    const supabase = createPublicClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection is not configured yet." },
        { status: 503 }
      );
    }

    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: parsed.data.fullName,
      email: parsed.data.email,
      message: parsed.data.message,
      status: "unread",
      ip_hash: ipHash,
    });

    if (insertError) {
      return NextResponse.json(
        { error: "Failed to save your message. Please try again." },
        { status: 500 }
      );
    }

    // Optional Resend email notification (non-fatal if unconfigured)
    if (process.env.RESEND_API_KEY) {
      try {
        const profile = await getPublicProfile();
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
          to: [profile.email || process.env.ADMIN_EMAIL || "fahimhmihad@gmail.com"],
          replyTo: parsed.data.email,
          subject: `New portfolio message from ${parsed.data.fullName}`,
          text: `Name: ${parsed.data.fullName}\nEmail: ${parsed.data.email}\n\n${parsed.data.message}`,
        });
      } catch {
        // Message is already safely persisted in Supabase
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
