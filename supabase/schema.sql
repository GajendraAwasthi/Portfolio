-- =========================================================
-- GAJENDRA AWASTHI PORTFOLIO - SUPABASE DATABASE SCHEMA
-- Run this script in your Supabase SQL Editor
-- =========================================================

-- Enable UUID and PGCrypto extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Admin Users Table (Secure Password Hashing with Bcrypt)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 2. Auth Sessions Table (Database-backed Sessions)
CREATE TABLE IF NOT EXISTS auth_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Login Attempts & Security Audit Log
CREATE TABLE IF NOT EXISTS login_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address TEXT NOT NULL,
    username_attempted TEXT,
    success BOOLEAN NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    meta_title TEXT NOT NULL,
    meta_description TEXT NOT NULL,
    meta_keywords TEXT NOT NULL,
    og_image TEXT,
    favicon TEXT,
    theme_color TEXT DEFAULT '#1e3a8a',
    enable_audio_easter_egg BOOLEAN DEFAULT true,
    mobile_audio_src TEXT DEFAULT '/src/tismarmobile.MP3',
    desktop_audio_src TEXT DEFAULT '/src/tesmardesktop.MP3',
    attention_title_blink BOOLEAN DEFAULT true,
    footer_owner TEXT DEFAULT 'Gajendra Awasthi',
    footer_tagline TEXT,
    footer_subtext TEXT,
    last_updated_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Profile & Hero Table
CREATE TABLE IF NOT EXISTS profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL,
    surname_gradient TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    headline_typing JSONB NOT NULL DEFAULT '[]'::jsonb,
    description TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
    cta_buttons JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. About Cards
CREATE TABLE IF NOT EXISTS about_cards (
    id TEXT PRIMARY KEY,
    icon TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Stat Counters
CREATE TABLE IF NOT EXISTS stats (
    id TEXT PRIMARY KEY,
    target_number INTEGER NOT NULL,
    suffix TEXT DEFAULT '',
    label TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Education Table
CREATE TABLE IF NOT EXISTS education (
    id TEXT PRIMARY KEY,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    timeline TEXT NOT NULL,
    stream TEXT,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Experience Table
CREATE TABLE IF NOT EXISTS experience (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    duration TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    percentage INTEGER NOT NULL,
    category TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Certifications Table
CREATE TABLE IF NOT EXISTS certifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    issuer TEXT,
    issue_date TEXT,
    credential_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    team TEXT,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    github_url TEXT,
    live_url TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Videos Table
CREATE TABLE IF NOT EXISTS videos (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    youtube_url TEXT NOT NULL,
    embed_id TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Terminal Commands Table
CREATE TABLE IF NOT EXISTS terminal_commands (
    id TEXT PRIMARY KEY,
    command TEXT NOT NULL,
    output TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE terminal_commands ENABLE ROW LEVEL SECURITY;

-- 1. STRICT SECURITY: admin_users, auth_sessions, login_attempts
-- NO public access permitted (No SELECT/INSERT/UPDATE for anon)
-- Only service_role (backend server) can access authentication tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN ('admin_users', 'auth_sessions', 'login_attempts')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Service role full access on %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Service role full access on %I" ON %I FOR ALL USING (auth.jwt() ->> ''role'' = ''service_role'') WITH CHECK (auth.jwt() ->> ''role'' = ''service_role'');', tbl, tbl);
    END LOOP;
END $$;

-- 2. PUBLIC READ ACCESS: Public portfolio content tables
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name IN (
            'site_settings', 'profile', 'about_cards', 'stats',
            'education', 'experience', 'skills', 'certifications',
            'projects', 'videos', 'terminal_commands'
          )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public read access on %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Public read access on %I" ON %I FOR SELECT USING (true);', tbl, tbl);

        EXECUTE format('DROP POLICY IF EXISTS "Full access for service role on %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Full access for service role on %I" ON %I FOR ALL USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;
