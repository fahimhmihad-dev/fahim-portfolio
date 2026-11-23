import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdmin, unauthorizedResponse } from "@/lib/auth";
import { CACHE_TAGS, revalidatePortfolio } from "@/lib/data";

const profileSchema = z.object({
  name: z.string().trim().min(1).max(120),
  first_name: z.string().trim().min(1).max(60),
  last_name: z.string().trim().min(1).max(60),
  greeting: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(160),
  bio: z.string().max(2000).default(""),
  location: z.string().max(120).default(""),
  avatar_url: z.string().nullable().optional(),
  show_animated_photo: z.boolean().default(true),
  photo_animation_style: z.enum(["float", "tilt", "minimal"]).default("tilt"),
  photo_alt: z.string().max(160).default("Portrait of Fahim H. Mihad"),
  resume_url: z.string().nullable().optional(),
  email: z.string().trim().email(),
  socials: z
    .object({
      github: z.string().optional().default(""),
      linkedin: z.string().optional().default(""),
      twitter: z.string().optional().default(""),
      instagram: z.string().optional().default(""),
      facebook: z.string().optional().default(""),
      youtube: z.string().optional().default(""),
      website: z.string().optional().default(""),
    })
    .default({
      github: "",
      linkedin: "",
      twitter: "",
      instagram: "",
      facebook: "",
      youtube: "",
      website: "",
    }),
  seo_title: z.string().max(160).default(""),
  seo_description: z.string().max(400).default(""),
  seo_keywords: z.array(z.string()).default([]),
  og_image_url: z.string().nullable().optional(),
  github_repo: z.string().nullable().optional(),
});

export async function GET() {
  const admin = await verifyAdmin();
  if (!admin) return unauthorizedResponse();

  const { data, error } = await admin.supabase
    .from("profile")
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
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { data, error } = await admin.supabase
    .from("profile")
    .upsert({ id: 1, ...parsed.data }, { onConflict: "id" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePortfolio([CACHE_TAGS.PROFILE]);
  return NextResponse.json({ data });
}
