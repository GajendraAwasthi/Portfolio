import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from './rate-limiter';

const COOKIE_NAME = 'portfolio_session_token';
const LOCAL_AUTH_FILE = path.join(process.cwd(), 'data', 'auth-store.json');

// Initial admin configuration
const DEFAULT_INITIAL_ADMIN = {
  id: 'usr-default-admin',
  username: 'admin',
  email: 'gajendraawasthi456@gmail.com',
  password_hash: '$2b$10$o4U0JGEvS4hz1IwY.H/qyuU5QX.hxW/iyRzDlDBhw/G.BqPFzhLvO',
  created_at: new Date().toISOString(),
  last_login: null,
};

interface LocalAuthStore {
  admin_users: typeof DEFAULT_INITIAL_ADMIN[];
  auth_sessions: {
    id: string;
    user_id: string;
    session_token: string;
    ip_address?: string;
    user_agent?: string;
    expires_at: string;
    created_at: string;
  }[];
}

function getLocalAuthData(): LocalAuthStore {
  try {
    if (fs.existsSync(LOCAL_AUTH_FILE)) {
      const content = fs.readFileSync(LOCAL_AUTH_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.error('Error reading local auth store:', error);
  }
  const initial = {
    admin_users: [DEFAULT_INITIAL_ADMIN],
    auth_sessions: [],
  };
  saveLocalAuthData(initial);
  return initial;
}

function saveLocalAuthData(data: LocalAuthStore): void {
  try {
    const dir = path.dirname(LOCAL_AUTH_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_AUTH_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving local auth store:', error);
  }
}

/**
 * Validate username & password against database
 */
export async function authenticateAdmin(
  usernameInput: string,
  passwordInput: string,
  clientIp: string,
  userAgent: string = ''
): Promise<{ success: boolean; error?: string; remainingAttempts?: number }> {
  const username = usernameInput.trim();

  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(clientIp, username);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: rateLimit.errorMessage || 'Too many attempts. Access is temporarily restricted. Please try again later.',
      remainingAttempts: 0,
    };
  }

  // 2. Query user from Database
  let user: { id: string; username: string; password_hash: string } | null = null;

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .ilike('username', username)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        user = data;
      }
    }
  }

  // Fallback to local database store if Supabase not yet seeded or configured
  if (!user) {
    const localAuth = getLocalAuthData();
    const found = localAuth.admin_users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase()
    );
    if (found) {
      user = found;
    }
  }

  // 3. User not found -> record failure and return generic secure error
  if (!user || !user.password_hash) {
    const penalty = recordFailedAttempt(clientIp, username);
    return {
      success: false,
      error: penalty.errorMessage,
      remainingAttempts: penalty.remainingAttempts,
    };
  }

  // 4. Verify Bcrypt password hash
  const isValid = await bcrypt.compare(passwordInput, user.password_hash);
  if (!isValid) {
    const penalty = recordFailedAttempt(clientIp, username);
    return {
      success: false,
      error: penalty.errorMessage,
      remainingAttempts: penalty.remainingAttempts,
    };
  }

  // 5. Successful Login -> Reset Rate Limiter
  resetRateLimit(clientIp, username);

  // 6. Generate Cryptographically Secure Session Token
  const sessionToken = generateSecureToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  // 7. Store Session in Database
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from('auth_sessions').insert({
          user_id: user.id,
          session_token: sessionToken,
          ip_address: clientIp,
          user_agent: userAgent,
          expires_at: expiresAt,
        });

        // Update last login
        await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', user.id);

        // Record successful login audit log
        await supabase.from('login_attempts').insert({
          ip_address: clientIp,
          username_attempted: username,
          success: true,
        });
      } catch (err) {
        console.error('Error recording session in Supabase:', err);
      }
    }
  }

  // Always update local session store as well
  const localAuth = getLocalAuthData();
  localAuth.auth_sessions.push({
    id: `sess-${Date.now()}`,
    user_id: user.id,
    session_token: sessionToken,
    ip_address: clientIp,
    user_agent: userAgent,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
  });
  saveLocalAuthData(localAuth);

  // 8. Set HTTP-Only Secure Cookie
  await setAdminSessionCookie(sessionToken);

  return { success: true };
}

/**
 * Verify current active session from database
 */
export async function verifyAdminSession(token?: string): Promise<boolean> {
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }
  if (!token) return false;

  const now = new Date().toISOString();

  // Check Supabase if configured
  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('auth_sessions')
          .select('id, expires_at')
          .eq('session_token', token)
          .gt('expires_at', now)
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          return true;
        }
      } catch (err) {
        console.error('Error verifying session in Supabase:', err);
      }
    }
  }

  // Check local session store
  const localAuth = getLocalAuthData();
  const session = localAuth.auth_sessions.find(
    (s) => s.session_token === token && new Date(s.expires_at) > new Date()
  );

  return Boolean(session);
}

/**
 * Terminate active session and delete from database
 */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          await supabase.from('auth_sessions').delete().eq('session_token', token);
        } catch {}
      }
    }

    const localAuth = getLocalAuthData();
    localAuth.auth_sessions = localAuth.auth_sessions.filter((s) => s.session_token !== token);
    saveLocalAuthData(localAuth);
  }

  cookieStore.delete(COOKIE_NAME);
}

export async function setAdminSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

function generateSecureToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}
