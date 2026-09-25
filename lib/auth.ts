import 'server-only';
import { cookies } from 'next/headers';
import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';
import { getSupabaseAdmin, isSupabaseConfigured, isSupabaseRequested } from './supabase';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from './rate-limiter';

const COOKIE_NAME = 'portfolio_session_token';
const LOCAL_AUTH_FILE = path.join(process.cwd(), 'data', 'auth-store.json');

interface AdminUser { id: string; username: string; password_hash: string }
interface LocalAuthStore {
  admin_users: AdminUser[];
  auth_sessions: {
    id: string;
    user_id: string;
    session_token: string;
    expires_at: string;
    created_at: string;
  }[];
}

function getLocalAuthData(): LocalAuthStore | null {
  try {
    const data = JSON.parse(fs.readFileSync(LOCAL_AUTH_FILE, 'utf8'));
    if (Array.isArray(data.admin_users) && Array.isArray(data.auth_sessions)) return data;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') console.error('Local authentication store is unavailable:', error);
  }
  return null;
}

function saveLocalAuthData(data: LocalAuthStore): void {
  const temporary = LOCAL_AUTH_FILE + '.' + randomBytes(8).toString('hex') + '.tmp';
  try {
    fs.writeFileSync(temporary, JSON.stringify(data), { encoding: 'utf8', mode: 0o600, flag: 'wx' });
    fs.renameSync(temporary, LOCAL_AUTH_FILE);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

function tokenDigest(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export async function authenticateAdmin(
  usernameInput: string, passwordInput: string, clientIp: string, userAgent = ''
): Promise<{ success: boolean; error?: string; remainingAttempts?: number }> {
  const username = usernameInput.trim();
  if (isSupabaseRequested() && !isSupabaseConfigured()) return { success: false, error: 'Authentication is not configured.' };
  const rateLimit = checkRateLimit(clientIp, username);
  if (!rateLimit.allowed) return { success: false, error: rateLimit.errorMessage, remainingAttempts: 0 };

  let user: AdminUser | null = null;
  const supabase = isSupabaseConfigured() ? getSupabaseAdmin() : null;
  if (supabase) {
    // This counter survives separate serverless instances; the in-memory limiter alone does not.
    const { count, error: limitError } = await supabase.from('login_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('username_attempted', username.toLowerCase()).eq('success', false)
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString());
    if (limitError) {
      console.error('Login limiter lookup failed:', limitError);
      return { success: false, error: 'Authentication is temporarily unavailable.' };
    }
    if ((count || 0) >= 5) {
      return { success: false, error: 'Too many failed attempts. Please try again later.', remainingAttempts: 0 };
    }
    const { data, error } = await supabase.from('admin_users')
      .select('id, username, password_hash').eq('username', username).limit(1).maybeSingle();
    if (error) {
      console.error('Admin lookup failed:', error);
      return { success: false, error: 'Authentication is temporarily unavailable.' };
    }
    user = data;
  } else if (!isSupabaseRequested()) {
    user = getLocalAuthData()?.admin_users.find(
      (candidate) => candidate.username.toLowerCase() === username.toLowerCase()
    ) || null;
  }

  if (!user || !(await bcrypt.compare(passwordInput, user.password_hash))) {
    if (supabase) {
      const { error } = await supabase.from('login_attempts').insert({
        ip_address: clientIp, username_attempted: username.toLowerCase(), success: false,
      });
      if (error) {
        console.error('Login limiter write failed:', error);
        return { success: false, error: 'Authentication is temporarily unavailable.' };
      }
    }
    const penalty = recordFailedAttempt(clientIp, username);
    return { success: false, error: penalty.errorMessage, remainingAttempts: penalty.remainingAttempts };
  }

  const token = randomBytes(32).toString('hex');
  const sessionToken = tokenDigest(token);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  if (supabase) {
    const { error } = await supabase.from('auth_sessions').insert({
      user_id: user.id, session_token: sessionToken, ip_address: clientIp,
      user_agent: userAgent.slice(0, 512), expires_at: expiresAt,
    });
    if (error) {
      console.error('Session creation failed:', error);
      return { success: false, error: 'Authentication is temporarily unavailable.' };
    }
    await supabase.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', user.id);
  } else {
    const local = getLocalAuthData();
    if (!local) return { success: false, error: 'Authentication is not configured.' };
    local.auth_sessions = local.auth_sessions.filter((session) => new Date(session.expires_at) > new Date());
    local.auth_sessions.push({
      id: 'sess-' + randomBytes(16).toString('hex'), user_id: user.id,
      session_token: sessionToken, expires_at: expiresAt, created_at: new Date().toISOString(),
    });
    saveLocalAuthData(local);
  }

  resetRateLimit(clientIp, username);
  await setAdminSessionCookie(token);
  return { success: true };
}

export async function verifyAdminSession(token?: string): Promise<boolean> {
  if (!token) token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return false;
  if (isSupabaseRequested() && !isSupabaseConfigured()) return false;
  const digest = tokenDigest(token);

  if (isSupabaseConfigured()) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return false;
    try {
      const { data, error } = await supabase.from('auth_sessions')
        .select('id, admin_users!inner(id)').eq('session_token', digest)
        .gt('expires_at', new Date().toISOString()).limit(1).maybeSingle();
      if (error) console.error('Session lookup failed:', error);
      return !error && Boolean(data);
    } catch (error) {
      console.error('Session lookup failed:', error);
      return false;
    }
  }

  const local = getLocalAuthData();
  return Boolean(local?.auth_sessions.some(
    (session) => session.session_token === digest && new Date(session.expires_at) > new Date() &&
      local.admin_users.some((user) => user.id === session.user_id)
  ));
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token && /^[a-f0-9]{64}$/.test(token)) {
    const digest = tokenDigest(token);
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const { error } = await supabase.from('auth_sessions').delete().eq('session_token', digest);
        if (error) console.error('Session deletion failed:', error);
      }
    } else if (!isSupabaseRequested()) {
      const local = getLocalAuthData();
      if (local) {
        local.auth_sessions = local.auth_sessions.filter((session) => session.session_token !== digest);
        saveLocalAuthData(local);
      }
    }
  }
  cookieStore.delete(COOKIE_NAME);
}

export async function setAdminSessionCookie(token: string): Promise<void> {
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, path: '/',
  });
}
