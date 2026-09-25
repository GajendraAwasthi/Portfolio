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
  - **Local Storage Cache**: Works immediately out of the box with zero external dependencies.
  - **Supabase Cloud Database**: Plug in your Supabase URL & Key to persist everything in PostgreSQL with Row Level Security (RLS).
  - **1-Click Cloud Sync**: Migrate all current local data directly to Supabase with one click from `/admin/settings`.
- **Vercel Ready**:
  - Native Edge-compatible authentication and zero build errors.

---

## 🚀 Quick Start (Local Development)

### 1. Install & Run
```bash
npm install
npm run dev
```

Visit:
- **Public Portfolio**: [http://localhost:3000](http://localhost:3000)
- **Admin Portal**: [http://localhost:3000/adlogin](http://localhost:3000/adlogin)
- **Admin CMS Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin)

### 2. Admin Authentication
- Access requires authentication via the `/adlogin` route.
- Admin credentials and sessions are managed securely in the database.

---

## 🗄️ Supabase Setup Guide

To link your live Supabase database:

1. **Create a project** at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase Dashboard.
3. Open [`supabase/schema.sql`](file:///d:/portfolio/Portfolio/supabase/schema.sql) in this repo, copy its contents, and run it in the SQL Editor to create all tables (including `admin_users`, `auth_sessions`, `login_attempts`) and strict RLS policies.
4. Open [`supabase/seed.sql`](file:///d:/portfolio/Portfolio/supabase/seed.sql), copy its contents, and run it to populate your initial data and encrypted admin user.
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
7. Open `/adlogin`, log in with your admin credentials stored in the `admin_users` table, visit `/admin/settings`, and verify the status shows **Supabase Connected**!

---

## 🚀 Deployment to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. In **Environment Variables**, add your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Click **Deploy**. Vercel will build and launch your live portfolio and admin CMS.

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
│   ├── auth.ts                 # Web Crypto HMAC-SHA256 session tokens
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
