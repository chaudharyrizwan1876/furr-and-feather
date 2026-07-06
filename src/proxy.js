import { NextResponse } from 'next/server';
import { verifySessionToken, COOKIE_NAME } from '@/lib/adminAuth';

// Next.js 16 mein "middleware" file convention deprecated ho gayi hai,
// ab "proxy" naam use hota hai — kaam same hai, bas naam badla hai.
//
// Ab admin protection unified /account login system se judi hai:
// koi bhi user login kar sakta hai /account se, lekin /admin/* tabhi
// khulega jab us user ka isAdmin: true ho (database mein set kiya gaya ho).
export async function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.isAdmin) {
      // Non-admin ya logged-out user ko account/login page par bhejo,
      // aur batao ke wapas admin panel par aana chahta tha
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
