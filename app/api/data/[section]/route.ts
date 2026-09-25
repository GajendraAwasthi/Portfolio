import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getPortfolioData, saveSectionData } from '@/lib/data-service';
import { PortfolioData } from '@/types/portfolio';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;
    const allData = await getPortfolioData();

    if (section === 'all') {
      return NextResponse.json(allData);
    }

    if (section in allData) {
      return NextResponse.json({ [section]: allData[section as keyof PortfolioData] });
    }

    return NextResponse.json({ error: `Section '${section}' not found` }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const isAuthenticated = await verifyAdminSession();
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized: Valid admin session required' }, { status: 401 });
    }

    const { section } = await params;
    const body = await req.json();

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

    const result = await saveSectionData(section as keyof PortfolioData, body.data);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: Promise<{ section: string }> }) {
  return POST(req, context);
}
