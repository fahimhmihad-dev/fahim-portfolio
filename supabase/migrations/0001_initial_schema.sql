-- ============================================================================
-- Fahim H. Mihad Portfolio — Initial Database Schema & Row Level Security
-- ============================================================================

create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Admins allowlist (controls write access across all tables and storage)
-- ----------------------------------------------------------------------------
create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint admins_email_lowercase check (email = lower(email))
);

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- Updated-at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- 2. Profile (singleton)
-- ----------------------------------------------------------------------------
create table if not exists public.profile (
  id integer primary key default 1 check (id = 1),
  name text not null default 'Fahim H. Mihad',
  first_name text not null default 'Fahim',
  last_name text not null default 'Mihad',
  greeting text not null default 'Hi, I am',
  title text not null default 'A Full Stack Web Developer',
  bio text not null default '',
  location text not null default '',
  avatar_url text,
  resume_url text,
  email text not null default 'fahimhmihad@gmail.com',
  socials jsonb not null default '{}'::jsonb,
  seo_title text not null default 'Fahim H. Mihad | Full Stack Web Developer',
  seo_description text not null default '',
  seo_keywords text[] not null default '{}',
  og_image_url text,
  github_repo text,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profile_updated_at on public.profile;
create trigger trg_profile_updated_at
  before update on public.profile
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. Skills / Tech Stack (also powers the 3D interactive keyboard)
-- ----------------------------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  short_description text not null default '',
  icon text not null default '',
  color text not null default '#38bdf8',
  category text not null default 'Frontend',
  shortcut text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_skills_order on public.skills (sort_order asc, created_at asc);

drop trigger if exists trg_skills_updated_at on public.skills;
create trigger trg_skills_updated_at
  before update on public.skills
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 4. Experiences
-- ----------------------------------------------------------------------------
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  company text not null,
  location text not null default '',
  start_date text not null,
  end_date text,
  is_current boolean not null default false,
  bullets text[] not null default '{}',
  tech_tags text[] not null default '{}',
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_experiences_order on public.experiences (sort_order asc, created_at desc);

drop trigger if exists trg_experiences_updated_at on public.experiences;
create trigger trg_experiences_updated_at
  before update on public.experiences
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 5. Projects
-- ----------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default 'Full Stack',
  tagline text not null default '',
  description text not null default '',
  cover_url text not null default '',
  backdrop_url text,
  gallery text[] not null default '{}',
  tech_frontend text[] not null default '{}',
  tech_backend text[] not null default '{}',
  tech_tags text[] not null default '{}',
  live_url text,
  repo_url text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_projects_order on public.projects (sort_order asc, created_at desc);

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 6. Blog Posts
-- ----------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  summary text not null default '',
  content text not null default '',
  cover_url text,
  author text not null default 'Fahim H. Mihad',
  tags text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  seo_og_image text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_blog_posts_status_date on public.blog_posts (status, published_at desc);

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 7. Newsletter Subscribers
-- ----------------------------------------------------------------------------
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  source text not null default 'website',
  created_at timestamptz not null default now()
);

create index if not exists idx_newsletter_created on public.newsletter_subscribers (created_at desc);

-- ----------------------------------------------------------------------------
-- 8. Contact Messages
-- ----------------------------------------------------------------------------
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'unread' check (status in ('unread', 'read', 'archived')),
  ip_hash text,
  created_at timestamptz not null default now()
);

create index if not exists idx_contact_messages_created on public.contact_messages (created_at desc);

-- ----------------------------------------------------------------------------
-- 9. Site Settings (singleton)
-- ----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  default_theme text not null default 'dark' check (default_theme in ('dark', 'light', 'system')),
  sections jsonb not null default '{"hero":true,"skills":true,"experience":true,"projects":true,"contact":true,"blog":true,"newsletter":true,"resume":true}'::jsonb,
  nav_links jsonb not null default '[]'::jsonb,
  footer_links jsonb not null default '[]'::jsonb,
  footer_text text not null default 'All rights reserved.',
  seo_default_title text not null default 'Fahim H. Mihad | Full Stack Web Developer',
  seo_default_description text not null default '',
  seo_default_og_image text,
  analytics_ga_id text,
  analytics_umami_id text,
  analytics_umami_url text,
  maintenance_mode boolean not null default false,
  maintenance_message text not null default 'This site is currently undergoing scheduled maintenance. Please check back shortly.',
  enable_3d_keyboard boolean not null default true,
  enable_particles boolean not null default true,
  enable_elastic_cursor boolean not null default true,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 10. Rate Limits (server-only table for serverless spam protection)
-- ----------------------------------------------------------------------------
create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limits_bucket_time on public.rate_limits (bucket, created_at desc);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

alter table public.admins enable row level security;
alter table public.profile enable row level security;
alter table public.skills enable row level security;
alter table public.experiences enable row level security;
alter table public.projects enable row level security;
alter table public.blog_posts enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings enable row level security;
alter table public.rate_limits enable row level security;

-- admins: an authenticated admin may verify their own membership only
drop policy if exists "admins_self_select" on public.admins;
create policy "admins_self_select" on public.admins
  for select to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- profile: public read, admin write
drop policy if exists "profile_public_read" on public.profile;
create policy "profile_public_read" on public.profile
  for select to anon, authenticated
  using (true);

drop policy if exists "profile_admin_write" on public.profile;
create policy "profile_admin_write" on public.profile
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- site_settings: public read, admin write
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read" on public.site_settings
  for select to anon, authenticated
  using (true);

drop policy if exists "site_settings_admin_write" on public.site_settings;
create policy "site_settings_admin_write" on public.site_settings
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- skills: public reads visible only; admin reads/writes all
drop policy if exists "skills_public_read" on public.skills;
create policy "skills_public_read" on public.skills
  for select to anon, authenticated
  using (visible = true or public.is_admin());

drop policy if exists "skills_admin_write" on public.skills;
create policy "skills_admin_write" on public.skills
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- experiences: public reads visible only; admin reads/writes all
drop policy if exists "experiences_public_read" on public.experiences;
create policy "experiences_public_read" on public.experiences
  for select to anon, authenticated
  using (visible = true or public.is_admin());

drop policy if exists "experiences_admin_write" on public.experiences;
create policy "experiences_admin_write" on public.experiences
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- projects: public reads visible only; admin reads/writes all
drop policy if exists "projects_public_read" on public.projects;
create policy "projects_public_read" on public.projects
  for select to anon, authenticated
  using (visible = true or public.is_admin());

drop policy if exists "projects_admin_write" on public.projects;
create policy "projects_admin_write" on public.projects
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- blog_posts: public reads published only; admin reads/writes all
drop policy if exists "blog_posts_public_read" on public.blog_posts;
create policy "blog_posts_public_read" on public.blog_posts
  for select to anon, authenticated
  using (status = 'published' or public.is_admin());

drop policy if exists "blog_posts_admin_write" on public.blog_posts;
create policy "blog_posts_admin_write" on public.blog_posts
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- contact_messages: public can INSERT only; only admin can SELECT/UPDATE/DELETE
drop policy if exists "contact_messages_public_insert" on public.contact_messages;
create policy "contact_messages_public_insert" on public.contact_messages
  for insert to anon, authenticated
  with check (
    char_length(trim(name)) between 2 and 120
    and char_length(trim(email)) between 5 and 200
    and char_length(trim(message)) between 10 and 5000
  );

drop policy if exists "contact_messages_admin_all" on public.contact_messages;
create policy "contact_messages_admin_all" on public.contact_messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- newsletter_subscribers: public can INSERT only; only admin can SELECT/UPDATE/DELETE
drop policy if exists "newsletter_public_insert" on public.newsletter_subscribers;
create policy "newsletter_public_insert" on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (
    char_length(trim(email)) between 5 and 200
    and status = 'active'
  );

drop policy if exists "newsletter_admin_all" on public.newsletter_subscribers;
create policy "newsletter_admin_all" on public.newsletter_subscribers
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- rate_limits: no public policies (service_role bypasses RLS)

-- ============================================================================
-- STORAGE BUCKET: media (public read, admin-only write/delete)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  15728640,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
    'application/pdf'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'media');

drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());
