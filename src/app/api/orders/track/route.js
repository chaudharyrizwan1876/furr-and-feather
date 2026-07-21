import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

// GET /api/orders/track — Lets guests track an order using Order ID + Phone
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const phone = searchParams.get('phone');

    if (!orderId || !phone) {
      return NextResponse.json({ message: 'Both Order ID and Phone are required' }, { status: 400 });
    }

    const order = await Order.findOne({ _id: orderId, phone: phone });

    if (!order) {
      return NextResponse.json({ message: 'Order not found — please check your Order ID or phone number' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
