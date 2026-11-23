export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  website?: string;
}

export interface Profile {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  greeting: string;
  title: string;
  bio: string;
  location: string;
  avatar_url: string | null;
  resume_url: string | null;
  email: string;
  socials: SocialLinks;
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  og_image_url: string | null;
  github_repo: string | null;
  updated_at: string;
}

export interface Skill {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  icon: string;
  color: string;
  category: string;
  shortcut: string | null;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  bullets: string[];
  tech_tags: string[];
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  cover_url: string;
  backdrop_url: string | null;
  gallery: string[];
  tech_frontend: string[];
  tech_backend: string[];
  tech_tags: string[];
  live_url: string | null;
  repo_url: string | null;
  featured: boolean;
  sort_order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export type BlogStatus = "draft" | "published";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cover_url: string | null;
  author: string;
  tags: string[];
  status: BlogStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name: string | null;
  status: "active" | "unsubscribed";
  source: string;
  created_at: string;
}

export type MessageStatus = "unread" | "read" | "archived";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  ip_hash: string | null;
  created_at: string;
}

export interface SectionVisibility {
  hero: boolean;
  skills: boolean;
  experience: boolean;
  projects: boolean;
  contact: boolean;
  blog: boolean;
  newsletter: boolean;
  resume: boolean;
}

export interface NavLinkItem {
  title: string;
  href: string;
  thumbnail?: string;
  visible?: boolean;
}

export interface FooterLinkItem {
  title: string;
  href: string;
}

export interface SiteSettings {
  id: number;
  default_theme: "dark" | "light" | "system";
  sections: SectionVisibility;
  nav_links: NavLinkItem[];
  footer_links: FooterLinkItem[];
  footer_text: string;
  seo_default_title: string;
  seo_default_description: string;
  seo_default_og_image: string | null;
  analytics_ga_id: string | null;
  analytics_umami_id: string | null;
  analytics_umami_url: string | null;
  maintenance_mode: boolean;
  maintenance_message: string;
  enable_3d_keyboard: boolean;
  enable_particles: boolean;
  enable_elastic_cursor: boolean;
  updated_at: string;
}

export interface PortfolioPayload {
  profile: Profile;
  settings: SiteSettings;
  skills: Skill[];
  experiences: Experience[];
  projects: Project[];
}
