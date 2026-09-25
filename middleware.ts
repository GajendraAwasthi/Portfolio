import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get('portfolio_session_token')?.value;

  // 1. Direct old /admin/login to /adlogin
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/adlogin', req.url));
  }

  // 2. Protect all /admin routes. The layout performs the authoritative session lookup.
  if (pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/adlogin', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/adlogin'],
};
