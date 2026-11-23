import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { CACHE_TAGS, revalidatePortfolio } from "@/lib/data";
import { slugify } from "@/lib/utils";
import { revalidatePath } from "next/cache";

const postSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(200),
  slug: z.string().trim().max(180).optional(),
  summary: z.string().max(600).default(""),
  content: z.string().max(100000).default(""),
  cover_url: z.string().max(1000).nullable().optional(),
  author: z.string().trim().min(1).max(120).default("Fahim H. Mihad"),
  tags: z.array(z.string().trim().min(1)).default([]),
  status: z.enum(["draft", "published"]).default("draft"),
  published_at: z.string().nullable().optional(),
  seo_title: z.string().max(160).nullable().optional(),
  seo_description: z.string().max(400).nullable().optional(),
  seo_og_image: z.string().max(1000).nullable().optional(),
});

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const { data, error } = await admin.supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data ?? [] });
}

export async function POST(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const body = await req.json();
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid blog post" },
      { status: 400 }
    );
  }

  const slug = parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.title);
  const publishedAt =
    parsed.data.status === "published"
      ? parsed.data.published_at || new Date().toISOString()
      : parsed.data.published_at || null;

  const { data, error } = await admin.supabase
    .from("blog_posts")
    .insert({
      ...parsed.data,
      slug: slug || `post-${Date.now()}`,
      cover_url: parsed.data.cover_url || null,
      seo_title: parsed.data.seo_title || null,
      seo_description: parsed.data.seo_description || null,
      seo_og_image: parsed.data.seo_og_image || null,
      published_at: publishedAt,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePortfolio([CACHE_TAGS.BLOGS]);
  revalidatePath(`/blogs/${data.slug}`);
  return NextResponse.json({ data }, { status: 201 });
}

export async function PUT(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const body = await req.json();
  const parsed = postSchema.extend({ id: z.string().uuid() }).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid blog post update" },
      { status: 400 }
    );
  }

  const { id, ...fields } = parsed.data;
  const slug = fields.slug ? slugify(fields.slug) : slugify(fields.title);
  const publishedAt =
    fields.status === "published"
      ? fields.published_at || new Date().toISOString()
      : fields.published_at || null;

  const { data, error } = await admin.supabase
    .from("blog_posts")
    .update({
      ...fields,
      slug: slug || `post-${Date.now()}`,
      cover_url: fields.cover_url || null,
      seo_title: fields.seo_title || null,
      seo_description: fields.seo_description || null,
      seo_og_image: fields.seo_og_image || null,
      published_at: publishedAt,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePortfolio([CACHE_TAGS.BLOGS]);
  revalidatePath(`/blogs/${data.slug}`);
  return NextResponse.json({ data });
}

export async function DELETE(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });

  const { error } = await admin.supabase.from("blog_posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePortfolio([CACHE_TAGS.BLOGS]);
  return NextResponse.json({ ok: true });
}
