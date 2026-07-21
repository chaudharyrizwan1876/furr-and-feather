import { cookies } from 'next/headers';
import { verifySessionToken, COOKIE_NAME } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

// GET /api/auth/me — Info about the currently logged-in user (from the session cookie)
export async function GET(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  return NextResponse.json({
    user: { userId: session.userId, name: session.name, email: session.email, isAdmin: session.isAdmin },
  });
}
