import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";

const patchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["unread", "read", "archived"]),
});

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const { data, error } = await admin.supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function PATCH(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message status" }, { status: 400 });
  }

  const { data, error } = await admin.supabase
    .from("contact_messages")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

  const { error } = await admin.supabase.from("contact_messages").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
