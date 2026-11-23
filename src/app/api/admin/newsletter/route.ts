import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

const broadcastSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  body: z.string().trim().min(10).max(20000),
});

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const { data, error } = await admin.supabase
    .from("newsletter_subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    data: data ?? [],
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
  });
}

export async function POST(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY is not set. Add it in Vercel environment variables to send broadcasts." },
      { status: 400 }
    );
  }

  const json = await req.json();
  const parsed = broadcastSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid email content" },
      { status: 400 }
    );
  }

  const { data: subscribers, error } = await admin.supabase
    .from("newsletter_subscribers")
    .select("email")
    .eq("status", "active");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ error: "No active subscribers to send to." }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM_EMAIL || "Fahim H. Mihad <onboarding@resend.dev>";

  const emails = subscribers.map((s) => s.email);
  // Send in small batches of 50 via BCC for privacy
  let sent = 0;
  for (let i = 0; i < emails.length; i += 50) {
    const batch = emails.slice(i, i + 50);
    await resend.emails.send({
      from,
      to: [admin.email],
      bcc: batch,
      subject: parsed.data.subject,
      text: parsed.data.body,
    });
    sent += batch.length;
  }

  return NextResponse.json({ ok: true, sent });
}

export async function DELETE(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

  const { error } = await admin.supabase.from("newsletter_subscribers").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
