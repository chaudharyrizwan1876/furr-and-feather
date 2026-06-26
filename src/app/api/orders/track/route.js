import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

// GET /api/orders/track — Guest bhi Order ID + Phone se track kar sake
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const phone = searchParams.get('phone');

    if (!orderId || !phone) {
      return NextResponse.json({ message: 'Order ID aur Phone dono chahiye' }, { status: 400 });
    }

    const order = await Order.findOne({ _id: orderId, phone: phone });

    if (!order) {
      return NextResponse.json({ message: 'Order nahi mila — Order ID ya phone check karo' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}