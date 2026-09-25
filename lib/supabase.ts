import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseUrl.startsWith('https://') && 
    supabaseServiceKey
  );
};

export const isSupabaseRequested = (): boolean => Boolean(supabaseUrl || supabaseAnonKey || supabaseServiceKey);

// Client for public / browser queries
export const getSupabaseClient = (): SupabaseClient | null => {
  if (!isSupabaseConfigured() || !supabaseAnonKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

// Server-side admin client (bypasses RLS using the required service role key)
export const getSupabaseAdmin = (): SupabaseClient | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};
