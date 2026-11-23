import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { CACHE_TAGS, revalidatePortfolio } from "@/lib/data";

const settingsSchema = z.object({
  default_theme: z.enum(["dark", "light", "system"]),
  sections: z.object({
    hero: z.boolean(),
    skills: z.boolean(),
    experience: z.boolean(),
    projects: z.boolean(),
    contact: z.boolean(),
    blog: z.boolean(),
    newsletter: z.boolean(),
    resume: z.boolean(),
  }),
  nav_links: z.array(
    z.object({
      title: z.string().min(1),
      href: z.string().min(1),
      thumbnail: z.string().optional(),
      visible: z.boolean().optional().default(true),
    })
  ),
  footer_links: z.array(
    z.object({
      title: z.string().min(1),
      href: z.string().min(1),
    })
  ),
  footer_text: z.string().max(240),
  seo_default_title: z.string().max(160),
  seo_default_description: z.string().max(400),
  seo_default_og_image: z.string().nullable().optional(),
  analytics_ga_id: z.string().nullable().optional(),
  analytics_umami_id: z.string().nullable().optional(),
  analytics_umami_url: z.string().nullable().optional(),
  maintenance_mode: z.boolean(),
  maintenance_message: z.string().max(600),
  enable_3d_keyboard: z.boolean(),
  enable_particles: z.boolean(),
  enable_elastic_cursor: z.boolean(),
});

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const { data, error } = await admin.supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function PUT(req: Request) {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Validation failed" },
      { status: 400 }
    );
  }

  const { data, error } = await admin.supabase
    .from("site_settings")
    .upsert({ id: 1, ...parsed.data }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePortfolio([CACHE_TAGS.SETTINGS]);
  return NextResponse.json({ data });
}
