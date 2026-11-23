import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { CACHE_TAGS, revalidatePortfolio } from "@/lib/data";
import { slugify } from "@/lib/utils";

const skillSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(80).optional(),
  name: z.string().trim().min(1).max(80),
  short_description: z.string().max(260).default(""),
  icon: z.string().max(600).default(""),
  color: z
    .string()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Use a valid hex color like #38bdf8")
    .default("#38bdf8"),
  category: z.string().trim().min(1).max(60).default("Frontend"),
  shortcut: z.string().max(24).nullable().optional(),
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
    .from("skills")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const body = await req.json();
  const parsed = skillSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid skill data" },
      { status: 400 }
    );
  }

  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name);

  let sortOrder = parsed.data.sort_order;
  if (sortOrder === undefined) {
    const { count } = await admin.supabase
      .from("skills")
      .select("*", { count: "exact", head: true });
    sortOrder = count ?? 0;
  }

  const { data, error } = await admin.supabase
    .from("skills")
    .insert({
      slug: slug || `skill-${Date.now()}`,
      name: parsed.data.name,
      short_description: parsed.data.short_description,
      icon: parsed.data.icon,
      color: parsed.data.color,
      category: parsed.data.category,
      shortcut: parsed.data.shortcut || null,
      sort_order: sortOrder,
      visible: parsed.data.visible,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePortfolio([CACHE_TAGS.SKILLS]);
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
          .from("skills")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id)
      )
    );
    revalidatePortfolio([CACHE_TAGS.SKILLS]);
    return NextResponse.json({ ok: true });
  }

  const parsed = skillSchema.extend({ id: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid skill update" },
      { status: 400 }
    );
  }

  const { id, ...fields } = parsed.data;
  const { data, error } = await admin.supabase
    .from("skills")
    .update({
      ...fields,
      slug: fields.slug ? slugify(fields.slug) : slugify(fields.name),
      shortcut: fields.shortcut || null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePortfolio([CACHE_TAGS.SKILLS]);
  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

  const { error } = await admin.supabase.from("skills").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePortfolio([CACHE_TAGS.SKILLS]);
  return NextResponse.json({ ok: true });
}
