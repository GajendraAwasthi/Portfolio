import { NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { checkSupabaseStatus, syncSeedToSupabase } from '@/lib/data-service';

export async function GET() {
  const status = await checkSupabaseStatus();
  return NextResponse.json(status);
}

export async function POST() {
  const isAuth = await verifyAdminSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized: Admin session required' }, { status: 401 });
  }

  const result = await syncSeedToSupabase();
  return NextResponse.json(result);
}
