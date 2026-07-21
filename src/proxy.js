import { NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/adminAuth';

// The "middleware" file convention was deprecated in Next.js 16 —
// it's now called "proxy" instead. Same behavior, just a different name.
//
// Admin protection is now tied to the unified /account login system:
// any user can log in from /account, but /admin/* only opens if that
// user's isAdmin is set to true (in the database).
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.isAdmin) {
      // Redirect non-admin or logged-out users to the account/login page,
      // and note that they were trying to reach the admin panel
      const loginUrl = new URL('/account', request.url);
      loginUrl.searchParams.set('redirect', '/admin');
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
