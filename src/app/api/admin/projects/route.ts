import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { CACHE_TAGS, revalidatePortfolio } from "@/lib/data";
import { slugify } from "@/lib/utils";

const projectSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().max(120).optional(),
  title: z.string().trim().min(1).max(140),
  category: z.string().trim().min(1).max(80).default("Full Stack"),
  tagline: z.string().max(300).default(""),
  description: z.string().max(20000).default(""),
  cover_url: z.string().max(1000).default(""),
  backdrop_url: z.string().max(1000).nullable().optional(),
  gallery: z.array(z.string().min(1)).default([]),
  tech_frontend: z.array(z.string().min(1)).default([]),
  tech_backend: z.array(z.string().min(1)).default([]),
  tech_tags: z.array(z.string().min(1)).default([]),
  live_url: z.string().max(600).nullable().optional(),
  repo_url: z.string().max(600).nullable().optional(),
  featured: z.boolean().default(false),
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
    .from("projects")
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
  const parsed = projectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid project data" },
      { status: 400 }
    );
  }

  let sortOrder = parsed.data.sort_order;
  if (sortOrder === undefined) {
    const { count } = await admin.supabase
      .from("projects")
      .select("*", { count: "exact", head: true });
    sortOrder = count ?? 0;
  }

  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);

  const { data, error } = await admin.supabase
    .from("projects")
    .insert({
      ...parsed.data,
      slug: slug || `project-${Date.now()}`,
      backdrop_url: parsed.data.backdrop_url || null,
      live_url: parsed.data.live_url || null,
      repo_url: parsed.data.repo_url || null,
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePortfolio([CACHE_TAGS.PROJECTS]);
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
          .from("projects")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id)
      )
    );
    revalidatePortfolio([CACHE_TAGS.PROJECTS]);
    return NextResponse.json({ ok: true });
  }

  const parsed = projectSchema.extend({ id: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid project update" },
      { status: 400 }
    );
  }

  const { id, ...fields } = parsed.data;
  const { data, error } = await admin.supabase
    .from("projects")
    .update({
      ...fields,
      slug: fields.slug ? slugify(fields.slug) : slugify(fields.title),
      backdrop_url: fields.backdrop_url || null,
      live_url: fields.live_url || null,
      repo_url: fields.repo_url || null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePortfolio([CACHE_TAGS.PROJECTS]);
  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

  const { error } = await admin.supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePortfolio([CACHE_TAGS.PROJECTS]);
  return NextResponse.json({ ok: true });
}
