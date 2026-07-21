import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createSessionToken, COOKIE_NAME } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

// POST /api/auth/login — Check email + password (works for both customers and admins).
// The response includes an isAdmin flag so the frontend can redirect to the right place.
export async function POST(request) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const token = await createSessionToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    const response = NextResponse.json({
      message: 'Login successful',
      user: { name: user.name, email: user.email, isAdmin: user.isAdmin },
    });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
