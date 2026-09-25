# Gajendra Awasthi - Next.js Portfolio & Dynamic CMS

A portfolio and dynamic Content Management System (CMS) built with **Next.js 15 (App Router)**, **Supabase (PostgreSQL Database)**, and optimized for **Vercel** deployment.

---

## 🌟 Key Features

- **Full Admin CMS (`/admin`)**:
  - **Dynamic Education & Experience**: Add, edit, reorder, or hide education degrees and professional experience records directly from the admin dashboard with instant live updates.
  - **Hero & Profile Customizer**: Update first/last name, gradient highlights, bio, typing tags, avatar photo URL, and resume/CV document.
  - **Skills & Categories**: Add technical skills with proficiency sliders and group them into custom categories.
  - **Certifications Lightbox**: Manage credentials and certificates with a responsive full-screen modal viewer.
  - **Projects Showcase**: Add project details, tech stacks, team members, GitHub links, and live demo buttons.
  - **YouTube Video Embeds**: Add YouTube tutorials and developer walkthroughs with automatic embed ID extraction.
  - **Interactive Terminal CLI**: Customize terminal commands (e.g. `help`, `about`, `skills`, `projects`, `contact`, `download`, or custom commands) executable in the hacker-style terminal modal.
  - **Audio Easter Eggs**: Built-in mobile device shake audio (*"Shake to cure bore"*) and tab-switch attention grabber.
  - **SEO & OpenGraph**: Control page titles, meta descriptions, social preview images, and browser favicons from the dashboard.
- **Dual Persistence Architecture**:
  - **Local file store**: Available for development after explicitly creating an admin account. Use a persistent filesystem.
  - **Supabase Cloud Database**: Set the Supabase URL and server-only service role key to persist everything in PostgreSQL with Row Level Security (RLS).
  - **1-Click Cloud Sync**: Migrate all current local data directly to Supabase with one click from `/admin/settings`.
- **Vercel Ready**:
  - Server-verified database sessions and production build support.

---

## 🚀 Quick Start (Local Development)

### 1. Install & Run
```bash
npm ci
npm run set-admin
npm run dev
```

Visit:
- **Public Portfolio**: [http://localhost:3000](http://localhost:3000)
- **Admin Portal**: [http://localhost:3000/adlogin](http://localhost:3000/adlogin)
- **Admin CMS Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

### 2. Admin Authentication
- Access requires authentication via the `/adlogin` route.
- No default admin password is installed. Run `npm run set-admin` before logging in.
- Local auth requires `data/auth-store.json` on persistent storage. A partial Supabase configuration fails closed.

---

## 🗄️ Supabase Setup Guide

To link your live Supabase database:

1. **Create a project** at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase Dashboard.
3. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor to create the tables and RLS policies. For an existing project, also run [`supabase/migrations/20260925_restrict_content_policies.sql`](supabase/migrations/20260925_restrict_content_policies.sql) before deploying this update.
4. On a new, empty database only, run [`supabase/seed.sql`](supabase/seed.sql) to populate initial portfolio content. The seed does not create an admin account.
5. In your Supabase Dashboard, go to **Project Settings** → **API** and copy:
   - `Project URL`
   - `anon / public` key
   - `service_role` key (keep secret!)
6. Paste them into your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   ```
7. Run `npm run set-admin` with the same environment to create or rotate the admin account and revoke prior sessions. If the seed was used in an older deployment, rotate that account before reopening the CMS.
8. Open `/adlogin`, log in, visit `/admin/settings`, and verify the status shows **Supabase Connected**.

---

## 🚀 Deployment to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. In **Environment Variables**, add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**. Vercel will build and launch your live portfolio and admin CMS.

The build no longer writes to Supabase. Use the authenticated sync action in `/admin/settings` only when you intend to replace cloud content from the local file. `npm run db:push` is the equivalent manual operation. Local file mode is unsuitable for Vercel because its filesystem is not persistent.

---

## 📂 Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with dynamic metadata & Google fonts
│   ├── page.tsx                # Public Portfolio page (Server component)
│   ├── PortfolioClient.tsx     # Public interactive client container
│   ├── globals.css             # Vanilla CSS design system & admin styles
│   ├── components/
│   │   ├── Header.tsx          # Fixed glass header & navigation
│   │   ├── Hero.tsx            # Hero with dynamic typing & CTA
│   │   ├── About.tsx           # Feature cards & animated counters
│   │   ├── Education.tsx       # Timeline with dynamic degrees
│   │   ├── Experience.tsx      # Professional experience cards
│   │   ├── Skills.tsx          # Categorized skills & percentage bars
│   │   ├── Certifications.tsx  # Gallery with full-screen lightbox
│   │   ├── Projects.tsx        # Project showcase & repository links
│   │   ├── Videos.tsx          # YouTube tutorials embed grid
│   │   ├── TerminalModal.tsx   # Interactive CLI console
│   │   ├── AudioEasterEgg.tsx  # Mobile shake & attention rotation
│   │   ├── Footer.tsx          # Social links & copyright
│   │   ├── BackToTop.tsx       # Smooth scroll button
│   │   └── Icons.tsx           # SVG brand icons (GitHub, LinkedIn, etc.)
│   ├── admin/
│   │   ├── layout.tsx          # Admin layout with sidebar navigation
│   │   ├── page.tsx            # Dashboard overview & quick actions
│   │   ├── login/page.tsx      # Secure password login
│   │   ├── education/page.tsx  # Full CRUD for Education records
│   │   ├── experience/page.tsx # Full CRUD for Experience records
│   │   ├── profile/page.tsx    # Hero branding, typing tags, socials
│   │   ├── skills/page.tsx     # Skills, categories & proficiency sliders
│   │   ├── certifications/page.tsx # Certificate badges & gallery
│   │   ├── projects/page.tsx   # Project records & tags
│   │   ├── videos/page.tsx     # YouTube video embeds
│   │   ├── about/page.tsx      # Feature cards & metric counters
│   │   ├── terminal/page.tsx   # Terminal CLI commands manager
│   │   └── settings/page.tsx   # SEO, audio settings & Supabase sync
│   └── api/
│       ├── auth/               # Login, logout, session verification
│       ├── data/[section]/     # Dynamic CMS data CRUD endpoints
│       └── sync/               # Supabase healthcheck & 1-click cloud push
├── lib/
│   ├── auth.ts                 # Random session tokens stored as SHA-256 digests
│   ├── data-service.ts         # Unified dual-persistence (Supabase + local)
│   ├── default-data.ts         # Seed data matching original portfolio
│   └── supabase.ts             # Supabase client & admin client
├── public/
│   └── src/                    # Certificates, resume PDF, and audio assets
├── supabase/
│   ├── schema.sql              # PostgreSQL DDL with RLS policies
│   └── seed.sql                # Initial data seed script
├── middleware.ts               # Route guard protecting /admin
├── vercel.json                 # Vercel deployment config
└── package.json
```
