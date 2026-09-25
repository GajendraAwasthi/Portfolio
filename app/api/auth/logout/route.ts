import { NextRequest, NextResponse } from 'next/server';
import { destroyAdminSession } from '@/lib/auth';
import { isSameOriginMutation } from '@/lib/request-security';

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await destroyAdminSession();
  return NextResponse.json({ success: true, message: 'Logged out and session terminated.' });
}
