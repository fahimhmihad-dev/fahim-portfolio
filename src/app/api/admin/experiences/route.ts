import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { CACHE_TAGS, revalidatePortfolio } from "@/lib/data";

const experienceSchema = z.object({
  id: z.string().uuid().optional(),
  role: z.string().trim().min(1).max(140),
  company: z.string().trim().min(1).max(140),
  location: z.string().max(120).default(""),
  start_date: z.string().trim().min(1).max(40),
  end_date: z.string().max(40).nullable().optional(),
  is_current: z.boolean().default(false),
  bullets: z.array(z.string().trim().min(1)).default([]),
  tech_tags: z.array(z.string().trim().min(1)).default([]),
  sort_order: z.number().int().optional(),
  visible: z.boolean().default(true),
});

const reorderSchema = z.object({
  reorder: z.array(z.object({ id: z.string().uuid(), sort_order: z.number().int() })),
});

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const { data, error } = await admin.supabase
    .from("experiences")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const body = await req.json();
  const parsed = experienceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid experience payload" },
      { status: 400 }
    );
  }

  let sortOrder = parsed.data.sort_order;
  if (sortOrder === undefined) {
    const { count } = await admin.supabase
      .from("experiences")
      .select("*", { count: "exact", head: true });
    sortOrder = count ?? 0;
  }

  const { data, error } = await admin.supabase
    .from("experiences")
    .insert({
      ...parsed.data,
      end_date: parsed.data.is_current ? null : parsed.data.end_date || null,
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePortfolio([CACHE_TAGS.EXPERIENCES]);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const body = await req.json();

  if (Array.isArray(body?.reorder)) {
    const parsed = reorderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid reorder payload" }, { status: 400 });
    }
    await Promise.all(
      parsed.data.reorder.map((item) =>
        admin.supabase
          .from("experiences")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id)
      )
    );
    revalidatePortfolio([CACHE_TAGS.EXPERIENCES]);
    return NextResponse.json({ ok: true });
  }

  const parsed = experienceSchema.extend({ id: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid experience update" },
      { status: 400 }
    );
  }

  const { id, ...fields } = parsed.data;
  const { data, error } = await admin.supabase
    .from("experiences")
    .update({
      ...fields,
      end_date: fields.is_current ? null : fields.end_date || null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePortfolio([CACHE_TAGS.EXPERIENCES]);
  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

  const { error } = await admin.supabase.from("experiences").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePortfolio([CACHE_TAGS.EXPERIENCES]);
  return NextResponse.json({ ok: true });
}
