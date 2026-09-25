import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Both username and password are required.' },
        { status: 400 }
      );
    }

    // Determine client IP address
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : realIp || '127.0.0.1';
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
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Server error occurred during authentication.' },
      { status: 500 }
    );
  }
}
