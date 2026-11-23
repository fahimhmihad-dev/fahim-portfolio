import { unstable_cache, revalidatePath, revalidateTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/server";
import {
  DEFAULT_BLOG_POSTS,
  DEFAULT_EXPERIENCES,
  DEFAULT_PROFILE,
  DEFAULT_PROJECTS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SKILLS,
} from "@/lib/defaults";
import type {
  BlogPost,
  Experience,
  PortfolioPayload,
  Profile,
  Project,
  SiteSettings,
  Skill,
} from "@/types/database";

export const CACHE_TAGS = {
  ALL: "portfolio",
  PROFILE: "profile",
  SETTINGS: "site_settings",
  SKILLS: "skills",
  EXPERIENCES: "experiences",
  PROJECTS: "projects",
  BLOGS: "blog_posts",
} as const;

export function revalidatePortfolio(tags: string[] = [CACHE_TAGS.ALL]) {
  const uniqueTags = new Set([CACHE_TAGS.ALL, ...tags]);
  for (const tag of uniqueTags) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch {
      // Fallback compatibility
    }
  }
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/blogs");
  revalidatePath("/news");
  revalidatePath("/resume");
  revalidatePath("/sitemap.xml");
}

export const getPublicProfile = unstable_cache(
  async (): Promise<Profile> => {
    const supabase = createPublicClient();
    if (!supabase) return DEFAULT_PROFILE;

    const { data, error } = await supabase
      .from("profile")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return DEFAULT_PROFILE;
    return {
      ...DEFAULT_PROFILE,
      ...data,
      socials: {
        ...DEFAULT_PROFILE.socials,
        ...(typeof data.socials === "object" && data.socials ? data.socials : {}),
      },
    };
  },
  ["public-profile"],
  { tags: [CACHE_TAGS.ALL, CACHE_TAGS.PROFILE], revalidate: 3600 }
);

export const getPublicSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const supabase = createPublicClient();
    if (!supabase) return DEFAULT_SITE_SETTINGS;

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data) return DEFAULT_SITE_SETTINGS;
    return {
      ...DEFAULT_SITE_SETTINGS,
      ...data,
      sections: {
        ...DEFAULT_SITE_SETTINGS.sections,
        ...(typeof data.sections === "object" && data.sections ? data.sections : {}),
      },
      nav_links: Array.isArray(data.nav_links) ? data.nav_links : DEFAULT_SITE_SETTINGS.nav_links,
      footer_links: Array.isArray(data.footer_links)
        ? data.footer_links
        : DEFAULT_SITE_SETTINGS.footer_links,
    };
  },
  ["public-site-settings"],
  { tags: [CACHE_TAGS.ALL, CACHE_TAGS.SETTINGS], revalidate: 3600 }
);

export const getPublicSkills = unstable_cache(
  async (): Promise<Skill[]> => {
    const supabase = createPublicClient();
    if (!supabase) return DEFAULT_SKILLS;

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error || !data) return DEFAULT_SKILLS;
    return data as Skill[];
  },
  ["public-skills"],
  { tags: [CACHE_TAGS.ALL, CACHE_TAGS.SKILLS], revalidate: 3600 }
);

export const getPublicExperiences = unstable_cache(
  async (): Promise<Experience[]> => {
    const supabase = createPublicClient();
    if (!supabase) return DEFAULT_EXPERIENCES;

    const { data, error } = await supabase
      .from("experiences")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return DEFAULT_EXPERIENCES;
    return data as Experience[];
  },
  ["public-experiences"],
  { tags: [CACHE_TAGS.ALL, CACHE_TAGS.EXPERIENCES], revalidate: 3600 }
);

export const getPublicProjects = unstable_cache(
  async (): Promise<Project[]> => {
    const supabase = createPublicClient();
    if (!supabase) return DEFAULT_PROJECTS;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("visible", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data) return DEFAULT_PROJECTS;
    return data as Project[];
  },
  ["public-projects"],
  { tags: [CACHE_TAGS.ALL, CACHE_TAGS.PROJECTS], revalidate: 3600 }
);

export const getPublishedBlogPosts = unstable_cache(
  async (): Promise<BlogPost[]> => {
    const supabase = createPublicClient();
    if (!supabase) return DEFAULT_BLOG_POSTS;

    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error || !data) return DEFAULT_BLOG_POSTS;
    return data as BlogPost[];
  },
  ["public-blog-posts"],
  { tags: [CACHE_TAGS.ALL, CACHE_TAGS.BLOGS], revalidate: 3600 }
);

export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getPublishedBlogPosts();
  return posts.find((p) => p.slug === slug) ?? null;
}

export async function getPortfolioPayload(): Promise<PortfolioPayload> {
  const [profile, settings, skills, experiences, projects] = await Promise.all([
    getPublicProfile(),
    getPublicSettings(),
    getPublicSkills(),
    getPublicExperiences(),
    getPublicProjects(),
  ]);

  return { profile, settings, skills, experiences, projects };
}
