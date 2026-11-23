# Fahim H. Mihad — Interactive 3D Developer Portfolio & CMS

An interactive 3D developer portfolio built for **Fahim H. Mihad** with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS v4**, **Three.js / React Three Fiber**, **GSAP + ScrollTrigger**, **Framer Motion (`motion`)**, **Lenis**, and a full **Supabase-backed Admin Dashboard (`/admin`)**.

---

## Features

- **Procedural 3D Mechanical Keyboard**: Sculpted Three.js / React Three Fiber keyboard dynamically populated from your Supabase `skills` table—press physical keys, hover, or tap keycaps for spring travel, emissive glow, synthesized Web Audio switch clicks, and scroll-choreographed GSAP camera transitions.
- **Accessible Fallbacks**: Automatically renders a crisp 2D glassmorphic Tech Stack card grid when `prefers-reduced-motion` is enabled, Data Saver is active, WebGL is unavailable, or the visitor toggles **Reduce motion** inside the navigation drawer.
- **Full Content Management (`/admin`)**:
  - Protected by Supabase Auth + `admins` table email allowlist + Next.js middleware/proxy.
  - Manage **Profile & Hero**, **Skills / 3D Keys** (drag-and-drop reorder, color picker, icon picker/upload), **Experience Timeline** (drag-and-drop, bullet editor, tech chips), **Projects** (cover, backdrop, Splide gallery, FloatingDock tech stacks, Markdown write-up), **Blog** (Markdown editor with live split preview, draft/publish, SEO), **Messages Inbox** (search, filter, read/unread/archive, `mailto:` reply, CSV export), **Newsletter** (CSV export + optional Resend broadcast), **Media Library** (Supabase Storage `media` bucket), and **Site Settings** (section toggles, nav links, SEO/OG defaults, analytics IDs, maintenance mode).
  - Every save calls Next.js `revalidateTag` / `revalidatePath` so public pages reflect updates immediately.
- **Security & Spam Protection**: Strict PostgreSQL Row Level Security (RLS) across all tables and storage buckets, honeypot trap, minimum submit-time guard, and Supabase-backed rate limiting on contact and newsletter forms.
- **SEO Ready**: Dynamic metadata, generated Open Graph image (`/opengraph-image`), `sitemap.xml`, `robots.txt`, and `Person` JSON-LD structured data.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling & UI | Tailwind CSS v4, Radix UI / shadcn-style primitives, SCSS Modules |
| 3D & Motion | Three.js, React Three Fiber, GSAP + ScrollTrigger, `motion`, Lenis, Splide |
| Backend & Auth | Supabase (PostgreSQL, Row Level Security, Auth, Storage, `@supabase/ssr`) |
| Validation & Forms | Zod, React Hook Form |
| Email (Optional) | Resend |

---

## Local Setup

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Yes | Canonical site origin (e.g. `https://yourdomain.com` or `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server-only) | Supabase service role key (never exposed to browser; used for rate limiting) |
| `ADMIN_EMAIL` | Yes | Authorized administrator email (must also exist in `public.admins`) |
| `RESEND_API_KEY` | No | Optional Resend API key for contact email alerts & newsletter broadcasts |
| `RESEND_FROM_EMAIL` | No | Verified sender address in Resend |
| `NEXT_PUBLIC_GA_ID` | No | Optional Google Analytics 4 ID (also configurable in `/admin/settings`) |

### 3. Run Supabase Migrations

Execute the SQL files in `supabase/migrations/` in order inside your Supabase SQL Editor (or via `supabase db push`):

1. `supabase/migrations/0001_initial_schema.sql` — tables, indexes, `is_admin()` helper, strict RLS policies, and `media` storage bucket.
2. `supabase/migrations/0002_seed_data.sql` — initial admin allowlist (`fahimhmihad@gmail.com`) and editable placeholder content.

### 4. Add an Admin User

1. Ensure the user's lowercase email exists in `public.admins`:
   ```sql
   insert into public.admins (email) values ('fahimhmihad@gmail.com') on conflict do nothing;
   ```
2. Create the matching user with email & password in **Supabase Dashboard → Authentication → Users → Add User** (with **Auto Confirm User** enabled).
3. Sign in at `/admin/login`.

### 5. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/admin](http://localhost:3000/admin) for the dashboard.

---

## Swapping the 3D Asset

The 3D mechanical keyboard is procedurally constructed in:
- `src/components/keyboard/keycap-geometry.ts`
- `src/components/keyboard/keyboard-scene.tsx`

To replace the procedural keycap or chassis with a custom `.glb` model, drop your `.glb` file into `public/assets/` and replace the `<mesh geometry={keycapGeo} />` in `src/components/keyboard/keyboard-scene.tsx` with a loaded `GLTFLoader` / `useGLTF` mesh.

---

## Deployment (Vercel)

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Configure all environment variables from `.env.example` for **Production**, **Preview**, and **Development**.
4. Deploy. Every subsequent push to `main` triggers an automatic production build.
