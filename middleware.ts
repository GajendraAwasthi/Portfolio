import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get('portfolio_session_token')?.value;

  // 1. Direct old /admin/login to /adlogin
  if (pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/adlogin', req.url));
  }

  // 2. If logged in and visiting /adlogin, redirect to /admin dashboard
  if (pathname === '/adlogin' && sessionToken) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // 3. Protect all /admin routes
  if (pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/adlogin', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  // 4. Extra Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/adlogin'],
};
