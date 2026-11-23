-- ============================================================================
-- Fahim H. Mihad Portfolio — Initial Seed Data (Editable from /admin)
-- ============================================================================

-- 1. Authorized Admin
insert into public.admins (email)
values ('fahimhmihad@gmail.com')
on conflict (email) do nothing;

-- 2. Profile (singleton)
insert into public.profile (
  id, name, first_name, last_name, greeting, title, bio, location,
  email, socials, seo_title, seo_description, seo_keywords
)
values (
  1,
  'Fahim H. Mihad',
  'Fahim H.',
  'Mihad',
  'Hi, I am',
  'A Full Stack Web Developer',
  'Software engineer building interactive web apps, scalable backend systems, and polished user experiences. Edit this bio anytime from the admin dashboard.',
  'Dhaka, Bangladesh',
  'fahimhmihad@gmail.com',
  '{
    "github": "https://github.com/fahimhmihad-dev",
    "linkedin": "https://linkedin.com/in/fahimhmihad",
    "twitter": "https://x.com/fahimhmihad",
    "instagram": ""
  }'::jsonb,
  'Fahim H. Mihad | Full Stack Web Developer',
  'Explore the interactive 3D portfolio of Fahim H. Mihad — full-stack developer crafting fast web applications, cloud systems, and thoughtful digital interfaces.',
  array['Fahim H. Mihad', 'Full Stack Developer', 'Web Developer', 'Next.js', 'TypeScript', 'React', 'Three.js', 'Portfolio']
)
on conflict (id) do nothing;

-- 3. Site Settings (singleton)
insert into public.site_settings (
  id, default_theme, sections, nav_links, footer_links, footer_text,
  seo_default_title, seo_default_description
)
values (
  1,
  'dark',
  '{"hero":true,"skills":true,"experience":true,"projects":true,"contact":true,"blog":true,"newsletter":true,"resume":true}'::jsonb,
  '[
    {"title":"Home","href":"/","thumbnail":"/placeholders/nav-home.svg","visible":true},
    {"title":"Skills","href":"/#skills","thumbnail":"/placeholders/nav-skills.svg","visible":true},
    {"title":"Experience","href":"/#experience","thumbnail":"/placeholders/nav-experience.svg","visible":true},
    {"title":"Projects","href":"/#projects","thumbnail":"/placeholders/nav-projects.svg","visible":true},
    {"title":"Blogs","href":"/blogs","thumbnail":"/placeholders/nav-blog.svg","visible":true},
    {"title":"Contact","href":"/#contact","thumbnail":"/placeholders/nav-contact.svg","visible":true}
  ]'::jsonb,
  '[
    {"title":"Blog","href":"/blogs"},
    {"title":"Newsletter","href":"/news"},
    {"title":"Resume","href":"/resume"}
  ]'::jsonb,
  'All rights reserved.',
  'Fahim H. Mihad | Full Stack Web Developer',
  'Interactive 3D developer portfolio of Fahim H. Mihad.'
)
on conflict (id) do nothing;

-- 4. Skills (18 skills -> clean 6x3 3D mechanical keyboard layout)
insert into public.skills (slug, name, short_description, icon, color, category, shortcut, sort_order, visible)
values
  ('typescript', 'TypeScript', 'Typed JavaScript for scalable, fearless refactors across client and server.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg', '#3178c6', 'Frontend', 'KeyQ', 0, true),
  ('javascript', 'JavaScript', 'The language of the web powering interactive interfaces and modern runtimes.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg', '#f0db4f', 'Frontend', 'KeyW', 1, true),
  ('react', 'React', 'Component-driven UI engineering with hooks, suspense, and concurrent rendering.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg', '#61dafb', 'Frontend', 'KeyE', 2, true),
  ('nextjs', 'Next.js', 'Full-stack React framework with App Router, Server Components, and instant edge caching.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg', '#ffffff', 'Frontend', 'KeyR', 3, true),
  ('tailwindcss', 'Tailwind CSS', 'Utility-first styling system for rapid, consistent, responsive interfaces.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg', '#38bdf8', 'Frontend', 'KeyT', 4, true),
  ('threejs', 'Three.js', 'Real-time 3D WebGL scenes, shaders, and interactive spatial experiences.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/threejs/threejs-original.svg', '#a855f7', 'Frontend', 'KeyY', 5, true),

  ('nodejs', 'Node.js', 'Event-driven server runtime for APIs, workers, and realtime services.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg', '#6cc24a', 'Backend', 'KeyA', 6, true),
  ('python', 'Python', 'Clean backend scripting, automation pipelines, and AI/ML workflows.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg', '#3776ab', 'Backend', 'KeyS', 7, true),
  ('postgresql', 'PostgreSQL', 'Rock-solid relational database with JSONB, indexing, and Row Level Security.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg', '#336791', 'Database', 'KeyD', 8, true),
  ('supabase', 'Supabase', 'Postgres backend with Auth, Realtime, Storage, and Edge Functions.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg', '#3ecf8e', 'Backend', 'KeyF', 9, true),
  ('mongodb', 'MongoDB', 'Flexible document store for rapid prototyping and high-throughput workloads.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg', '#47a248', 'Database', 'KeyG', 10, true),
  ('redis', 'Redis', 'In-memory caching, rate limiting, queues, and pub/sub messaging.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg', '#dc382d', 'Database', 'KeyH', 11, true),

  ('docker', 'Docker', 'Reproducible container builds for predictable local dev and production deploys.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg', '#2496ed', 'DevOps', 'KeyZ', 12, true),
  ('git', 'Git', 'Version control, clean branching workflows, and collaborative code reviews.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg', '#f1502f', 'Tools', 'KeyX', 13, true),
  ('linux', 'Linux', 'Server administration, shell automation, and production observability.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/linux/linux-original.svg', '#eab308', 'DevOps', 'KeyC', 14, true),
  ('aws', 'AWS', 'Cloud compute, storage, CDN, and managed infrastructure at scale.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg', '#ff9900', 'DevOps', 'KeyV', 15, true),
  ('vercel', 'Vercel', 'Zero-config edge deployments, preview URLs, and serverless compute.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg', '#e2e8f0', 'DevOps', 'KeyB', 16, true),
  ('figma', 'Figma', 'Design systems, interactive prototypes, and pixel-accurate developer handoff.', 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/figma/figma-original.svg', '#f24e1e', 'Tools', 'KeyN', 17, true)
on conflict (slug) do nothing;

-- 5. Experiences (Placeholder entries — replace from /admin/experience)
insert into public.experiences (role, company, location, start_date, end_date, is_current, bullets, tech_tags, sort_order, visible)
select * from (
  values
    (
      'Full Stack Software Engineer (Sample)',
      'Your Current Company · Replace in Admin',
      'Remote',
      'Jan 2025',
      null,
      true,
      array[
        'Architected end-to-end web applications with Next.js, TypeScript, and PostgreSQL serving thousands of monthly users.',
        'Designed secure REST/RPC APIs with strict Row Level Security, caching strategies, and automated CI/CD pipelines.',
        'Collaborated across design and product to deliver accessible, high-Lighthouse-score interfaces.',
        'Replace these sample bullet points with your real achievements from the Admin Dashboard.'
      ],
      array['Next.js', 'TypeScript', 'React', 'PostgreSQL', 'Supabase', 'Tailwind CSS', 'Docker'],
      0,
      true
    ),
    (
      'Frontend & Product Developer (Sample)',
      'Previous Studio · Replace in Admin',
      'Dhaka / Remote',
      'Jun 2023',
      'Dec 2024',
      false,
      array[
        'Built responsive design systems and interactive dashboards with React, Tailwind CSS, and Framer Motion.',
        'Optimized core web vitals and bundle sizes through code-splitting, image pipelines, and edge caching.',
        'Edit or delete this placeholder role anytime inside /admin/experience.'
      ],
      array['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Git', 'Vercel'],
      1,
      true
    )
) as v(role, company, location, start_date, end_date, is_current, bullets, tech_tags, sort_order, visible)
where not exists (select 1 from public.experiences);

-- 6. Projects (Placeholder entries — replace from /admin/projects)
insert into public.projects (
  slug, title, category, tagline, description, cover_url, backdrop_url, gallery,
  tech_frontend, tech_backend, tech_tags, live_url, repo_url, featured, sort_order, visible
)
values
  (
    'sample-saas-platform',
    'PulseBoard Analytics',
    'Full Stack SaaS',
    'Real-time product metrics and team workspace dashboard (Sample Project).',
    E'### Overview\n\n**PulseBoard Analytics** is a sample project entry showcasing how rich Markdown write-ups, technology docks, and interactive screenshot carousels appear inside your portfolio modal.\n\n### Key Highlights\n\n- **Real-time telemetry** with sub-second chart updates and customizable workspace views.\n- **Role-based access control** backed by PostgreSQL Row Level Security.\n- **Fully editable** — swap this title, cover image, gallery screenshots, links, and description from `/admin/projects`.',
    '/placeholders/project-1.svg',
    '/placeholders/bg-1.svg',
    array['/placeholders/project-1.svg', '/placeholders/project-2.svg'],
    array['Next.js', 'TypeScript', 'Tailwind CSS', 'React'],
    array['Supabase', 'PostgreSQL', 'Node.js', 'Vercel'],
    array['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'PostgreSQL'],
    'https://example.com',
    'https://github.com/fahimhmihad',
    true,
    0,
    true
  ),
  (
    'sample-ai-workspace',
    'NovaDocs AI',
    'AI Productivity',
    'Collaborative Markdown knowledge base with semantic search (Sample Project).',
    E'### Overview\n\n**NovaDocs AI** demonstrates a multi-screenshot project detail view with clean typography and interactive zoomable previews.\n\n### Architecture\n\n- Vector-indexed document retrieval with hybrid full-text search.\n- Offline-resilient editor with instant sync and version history.\n- Replace this placeholder entry with one of your flagship builds via `/admin/projects`.',
    '/placeholders/project-2.svg',
    '/placeholders/bg-2.svg',
    array['/placeholders/project-2.svg', '/placeholders/project-3.svg'],
    array['React', 'TypeScript', 'Tailwind CSS'],
    array['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
    array['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis'],
    'https://example.com',
    'https://github.com/fahimhmihad',
    true,
    1,
    true
  ),
  (
    'sample-3d-experience',
    'Interactive 3D Portfolio',
    'Creative Web / 3D',
    'This very portfolio — procedural 3D mechanical keyboard + full Supabase CMS.',
    E'### Overview\n\nA custom-engineered 3D developer portfolio built with **Next.js 16**, **Three.js / React Three Fiber**, **GSAP ScrollTrigger**, and a full **Supabase-powered Admin Dashboard**.\n\n### Features\n\n- Procedurally sculpted interactive 3D mechanical keyboard dynamically generated from database skills.\n- Instant cache revalidation on every CMS update.\n- Full dark/light theming, Lenis smooth scroll, and accessible reduced-motion fallbacks.',
    '/placeholders/project-3.svg',
    '/placeholders/bg-3.svg',
    array['/placeholders/project-3.svg', '/placeholders/project-1.svg'],
    array['Next.js', 'Three.js', 'TypeScript', 'Tailwind CSS'],
    array['Supabase', 'PostgreSQL', 'Vercel'],
    array['Next.js', 'Three.js', 'TypeScript', 'Supabase', 'Tailwind CSS'],
    '/',
    'https://github.com/fahimhmihad-dev/fahim-portfolio',
    true,
    2,
    true
  )
on conflict (slug) do nothing;

-- 7. Blog Posts (Placeholder entries — edit or delete from /admin/blog)
insert into public.blog_posts (
  title, slug, summary, content, author, tags, status, published_at, seo_title, seo_description
)
values
  (
    'Building an Interactive 3D Developer Portfolio with Next.js & Supabase',
    'building-interactive-3d-portfolio',
    'How this portfolio combines a procedural Three.js mechanical keyboard, GSAP scroll choreography, and a live Supabase CMS.',
    E'Welcome to your new blog! This sample post is stored in **Supabase** and can be edited, unpublished, or replaced anytime from `/admin/blog`.\n\n## Why Build a CMS-Backed 3D Portfolio?\n\nMost interactive developer portfolios hardcode every skill, project, and job title into static files. By wiring a **React Three Fiber** scene directly to **Supabase + Next.js tag revalidation**, updating a single skill color or adding a new project in `/admin` refreshes the live site in seconds.\n\n## Architecture Highlights\n\n- **Procedural 3D Keyboard**: Sculpted keycaps generated in Three.js with tactile Web Audio feedback and GSAP ScrollTrigger camera choreography.\n- **Graceful Accessibility**: Automatic 2D card fallback whenever `prefers-reduced-motion` is enabled or WebGL is unavailable.\n- **Strict Row Level Security**: Public visitors can only read published content and submit contact/newsletter forms; only your verified admin account can write.\n\n> Tip: Head over to `/admin/blog` to edit this article or publish your first real dispatch!',
    'Fahim H. Mihad',
    array['engineering', 'threejs', 'nextjs', 'supabase'],
    'published',
    now(),
    'Building an Interactive 3D Developer Portfolio | Fahim H. Mihad',
    'Behind the scenes of an interactive 3D portfolio powered by Next.js, Three.js, and Supabase.'
  ),
  (
    'Notes on Performance, Motion, and Accessibility on the Modern Web',
    'performance-motion-accessibility',
    'Practical techniques for keeping 3D web experiences fast, responsive, and respectful of user motion preferences.',
    E'Rich visuals should never come at the cost of usability or frame rate. Here are a few principles baked into this portfolio:\n\n## 1. Lazy-Load Heavy Graphics\n\nThe Three.js canvas is dynamically imported on the client (`ssr: false`) so initial HTML paints immediately and search crawlers receive full semantic content.\n\n## 2. Respect `prefers-reduced-motion`\n\nUsers who prefer reduced motion—or toggle **Reduce motion** in the navigation drawer—automatically receive a crisp, fast 2D layout with zero distracting animations.\n\n## 3. Adaptive Pixel Ratio\n\nCapping WebGL DPR on mobile devices keeps batteries cool and animations smooth.',
    'Fahim H. Mihad',
    array['performance', 'accessibility', 'frontend'],
    'published',
    now() - interval '7 days',
    'Performance, Motion, and Accessibility | Fahim H. Mihad',
    'Keeping 3D web experiences fast, responsive, and accessible.'
  )
on conflict (slug) do nothing;
