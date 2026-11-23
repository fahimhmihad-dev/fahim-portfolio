import { NextResponse } from "next/server";
import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/server";
import { checkRateLimit, extractClientIp, hashIp } from "@/lib/rate-limit";

const subscribeSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address").max(200),
  name: z.string().trim().max(120).optional().default(""),
  website: z.string().max(0).optional().default(""),
  startedAt: z.number().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (typeof body?.website === "string" && body.website.trim().length > 0) {
      return NextResponse.json({ ok: true, message: "Subscribed!" });
    }

    if (typeof body?.startedAt === "number" && Date.now() - body.startedAt < 800) {
      return NextResponse.json(
        { error: "Please take a moment before subscribing." },
        { status: 429 }
      );
    }

    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const ipHash = hashIp(extractClientIp(req.headers));
    const rate = await checkRateLimit(`newsletter:${ipHash}`, 5, 600);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
      );
    }

    const supabase = createPublicClient();
    if (!supabase) {
      return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
    }

    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name || null,
      status: "active",
      source: "website",
    });

    if (error) {
      // Unique violation -> already subscribed
      if (error.code === "23505") {
        return NextResponse.json({
          ok: true,
          alreadySubscribed: true,
          message: "You're already on the list!",
        });
      }
      return NextResponse.json(
        { error: "Could not complete subscription. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Welcome aboard! You're subscribed." });
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }
}
