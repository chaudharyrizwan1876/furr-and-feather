import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { verifySessionToken, COOKIE_NAME } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';

// GET /api/orders/my — Logged-in user ke saare orders (session cookie se pehchana jata hai)
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const session = await verifySessionToken(token);

    if (!session || !session.userId) {
      return NextResponse.json({ message: 'Login zaroori hai' }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({ user: session.userId }).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
