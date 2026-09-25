import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';
import { isSameOriginMutation, readJsonBody } from '@/lib/request-security';

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const body = await readJsonBody(req, 4096);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid login request' }, { status: 400 });
    }
    const { username, password } = body as Record<string, unknown>;

    if (typeof username !== 'string' || typeof password !== 'string' || !username.trim() || !password || username.length > 128 || password.length > 1024) {
      return NextResponse.json(
        { error: 'Both username and password are required.' },
        { status: 400 }
      );
    }

    // Determine client IP address
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || 'unknown';
    const userAgent = req.headers.get('user-agent') || '';

    const authResult = await authenticateAdmin(username, password, clientIp, userAgent);

    if (!authResult.success) {
      const isRateLimited = authResult.remainingAttempts === 0;
      return NextResponse.json(
        {
          error: authResult.error || 'Invalid credentials.',
        },
        { status: isRateLimited ? 429 : 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Authentication successful.',
    });
  } catch (err) {
    const badRequest = err instanceof SyntaxError || (err instanceof Error &&
      ['JSON content type required', 'Request body required'].includes(err.message));
    if (!badRequest && !(err instanceof Error && err.message === 'Request body too large')) {
      console.error('Admin login failed:', err);
    }
    return NextResponse.json(
      { error: badRequest ? 'Invalid login request' : err instanceof Error && err.message === 'Request body too large' ? 'Request body too large' : 'Authentication is temporarily unavailable' },
      { status: badRequest ? 400 : err instanceof Error && err.message === 'Request body too large' ? 413 : 503 }
    );
  }
}
