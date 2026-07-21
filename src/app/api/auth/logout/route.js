import { NextResponse } from 'next/server';
import { COOKIE_NAME } from '@/lib/adminAuth';

// POST /api/auth/logout — Clear the session cookie
export async function POST(request) {
  const response = NextResponse.json({ message: 'Logged out' });
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
