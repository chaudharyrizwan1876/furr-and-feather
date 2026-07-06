import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createSessionToken, COOKIE_NAME } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

// POST /api/auth/register — Naya customer account banao
// IMPORTANT: Register se bana hua account hamesha customer hota hai (isAdmin: false).
// Admin account is route se kabhi nahi ban sakta — woh sirf seed script se banta hai.
export async function POST(request) {
  try {
    await connectDB();
    const { name, email, phone, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Naam, email aur password zaroori hain' }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ message: 'Is email se account already bana hua hai' }, { status: 400 });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      password,
      isAdmin: false, // hardcoded — register se kabhi admin nahi banta
    });

    const token = await createSessionToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    const response = NextResponse.json({
      message: 'Account ban gaya',
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
