-- Apply this migration to existing Supabase projects before deploying the CMS update.
-- The previous FOR ALL policy applied to every role, including anon.
DO $$
DECLARE
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'site_settings', 'profile', 'about_cards', 'stats', 'education',
        'experience', 'skills', 'certifications', 'projects', 'videos', 'terminal_commands'
    ] LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Full access for service role on %I" ON %I;', tbl, tbl);
        EXECUTE format('CREATE POLICY "Full access for service role on %I" ON %I FOR ALL TO service_role USING (true) WITH CHECK (true);', tbl, tbl);
    END LOOP;
END $$;

CREATE INDEX IF NOT EXISTS login_attempts_username_window_idx
    ON login_attempts (username_attempted, created_at) WHERE success = false;
