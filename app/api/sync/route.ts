import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { checkSupabaseStatus, syncSeedToSupabase } from '@/lib/data-service';
import { isSameOriginMutation } from '@/lib/request-security';

export async function GET() {
  if (!(await verifyAdminSession())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const status = await checkSupabaseStatus();
  return NextResponse.json(status);
}

export async function POST(req: NextRequest) {
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
  }

  const result = await syncSeedToSupabase();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
