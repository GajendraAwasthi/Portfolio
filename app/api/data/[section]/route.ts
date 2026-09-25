import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminSession } from '@/lib/auth';
import { getPortfolioData, saveSectionData, visiblePortfolioData } from '@/lib/data-service';
import { PortfolioData } from '@/types/portfolio';
import { isSameOriginMutation, readJsonBody } from '@/lib/request-security';
import { isValidSectionData } from '@/lib/validate-content';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;
    const allData = await getPortfolioData();
    const isAdmin = req.cookies.has('portfolio_session_token') && await verifyAdminSession();
    const visibleData = isAdmin ? allData : visiblePortfolioData(allData);

    if (section === 'all') {
      return NextResponse.json(visibleData, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      });
    }

    if (Object.hasOwn(allData, section)) {
      return NextResponse.json(
        { [section]: visibleData[section as keyof PortfolioData] },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        }
      );
    }

    return NextResponse.json({ error: `Section '${section}' not found` }, { status: 404 });
  } catch (err) {
    console.error('Portfolio read failed:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  if (!isSameOriginMutation(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized: Valid admin session required' }, { status: 401 });
    }

    const { section } = await params;
    const body = await readJsonBody(req, 256 * 1024);

    const validSections: (keyof PortfolioData)[] = [
      'settings',
      'profile',
      'aboutCards',
      'stats',
      'education',
      'experience',
      'skills',
      'certifications',
      'projects',
      'videos',
      'terminalCommands',
    ];

    if (!validSections.includes(section as keyof PortfolioData)) {
      return NextResponse.json({ error: `Invalid section: ${section}` }, { status: 400 });
    }

    const data = (body as Record<string, unknown>)?.data;
    if (!isValidSectionData(section as keyof PortfolioData, data)) {
      return NextResponse.json({ error: 'Invalid section data' }, { status: 400 });
    }
    const result = await saveSectionData(section as keyof PortfolioData, data as PortfolioData[keyof PortfolioData]);

    if (result.success) {
      try {
        revalidatePath('/', 'layout');
        revalidatePath('/admin', 'layout');
      } catch (cacheErr) {
        console.warn('Revalidation notice:', cacheErr);
      }
    }

    return NextResponse.json(result.success ? result : { error: result.message }, { status: result.success ? 200 : 500 });
  } catch (err) {
    const badRequest = err instanceof SyntaxError || (err instanceof Error &&
      ['JSON content type required', 'Request body required'].includes(err.message));
    if (!badRequest && !(err instanceof Error && err.message === 'Request body too large')) {
      console.error('Portfolio write failed:', err);
    }
    return NextResponse.json({ error: badRequest ? 'Invalid JSON request' : 'Server error' },
      { status: badRequest ? 400 : err instanceof Error && err.message === 'Request body too large' ? 413 : 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ section: string }> }) {
  return POST(req, context);
}
