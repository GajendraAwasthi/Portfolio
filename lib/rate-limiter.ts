/**
 * Rate Limiter for Login & Sensitive Endpoints
 * Implements sliding window rate-limiting by IP and Username
 */

interface RateLimitRecord {
  attempts: number;
  firstAttempt: number;
  lastAttempt: number;
  lockedUntil?: number;
}

const ipAttempts = new Map<string, RateLimitRecord>();
const userAttempts = new Map<string, RateLimitRecord>();

const MAX_ATTEMPTS = 5; // 5 allowed attempts
const WINDOW_MS = 15 * 60 * 1000; // 15-minute sliding window
const LOCKOUT_MS = 15 * 60 * 1000; // 15-minute lockout

function cleanExpiredRecords() {
  const now = Date.now();
  for (const [key, record] of ipAttempts.entries()) {
    if (now - record.lastAttempt > WINDOW_MS && (!record.lockedUntil || now > record.lockedUntil)) {
      ipAttempts.delete(key);
    }
  }
  for (const [key, record] of userAttempts.entries()) {
    if (now - record.lastAttempt > WINDOW_MS && (!record.lockedUntil || now > record.lockedUntil)) {
      userAttempts.delete(key);
    }
  }
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remainingAttempts: number;
  lockoutSecondsRemaining?: number;
  errorMessage?: string;
}

export function checkRateLimit(ip: string, username?: string): RateLimitCheckResult {
  cleanExpiredRecords();
  const now = Date.now();

  // Check IP Lockout
  const ipRecord = ipAttempts.get(ip);
  if (ipRecord?.lockedUntil && ipRecord.lockedUntil > now) {
    const seconds = Math.ceil((ipRecord.lockedUntil - now) / 1000);
    return {
      allowed: false,
      remainingAttempts: 0,
      lockoutSecondsRemaining: seconds,
      errorMessage: 'Too many failed attempts. Access is temporarily restricted. Please try again later.',
    };
  }

  // Check Username Lockout (protects against distributed attacks targeting a single account)
  if (username) {
    const userRecord = userAttempts.get(username.toLowerCase().trim());
    if (userRecord?.lockedUntil && userRecord.lockedUntil > now) {
      const seconds = Math.ceil((userRecord.lockedUntil - now) / 1000);
      return {
        allowed: false,
        remainingAttempts: 0,
        lockoutSecondsRemaining: seconds,
        errorMessage: 'Too many failed attempts. Access is temporarily restricted. Please try again later.',
      };
    }
  }

  const currentAttempts = Math.max(ipRecord?.attempts || 0, username ? userAttempts.get(username.toLowerCase().trim())?.attempts || 0 : 0);
  const remaining = Math.max(0, MAX_ATTEMPTS - currentAttempts);

  return {
    allowed: true,
    remainingAttempts: remaining,
  };
}

export function recordFailedAttempt(ip: string, username?: string): RateLimitCheckResult {
  const now = Date.now();

  // Update IP record
  let ipRec = ipAttempts.get(ip);
  if (!ipRec || now - ipRec.firstAttempt > WINDOW_MS) {
    ipRec = { attempts: 1, firstAttempt: now, lastAttempt: now };
  } else {
    ipRec.attempts += 1;
    ipRec.lastAttempt = now;
  }

  if (ipRec.attempts >= MAX_ATTEMPTS) {
    ipRec.lockedUntil = now + LOCKOUT_MS;
  }
  ipAttempts.set(ip, ipRec);

  // Update User record
  if (username) {
    const cleanUser = username.toLowerCase().trim();
    let userRec = userAttempts.get(cleanUser);
    if (!userRec || now - userRec.firstAttempt > WINDOW_MS) {
      userRec = { attempts: 1, firstAttempt: now, lastAttempt: now };
    } else {
      userRec.attempts += 1;
      userRec.lastAttempt = now;
    }

    if (userRec.attempts >= MAX_ATTEMPTS) {
      userRec.lockedUntil = now + LOCKOUT_MS;
    }
    userAttempts.set(cleanUser, userRec);
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - ipRec.attempts);
  const isLocked = Boolean(ipRec.lockedUntil && ipRec.lockedUntil > now);

  return {
    allowed: !isLocked,
    remainingAttempts: remaining,
    lockoutSecondsRemaining: isLocked ? Math.ceil(LOCKOUT_MS / 1000) : undefined,
    errorMessage: isLocked
      ? 'Too many failed login attempts. Access is temporarily restricted. Please try again later.'
      : 'Invalid username or password.',
  };
}

export function resetRateLimit(ip: string, username?: string) {
  ipAttempts.delete(ip);
  if (username) {
    userAttempts.delete(username.toLowerCase().trim());
  }
}
