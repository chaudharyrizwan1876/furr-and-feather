import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

// GET /api/orders/track-by-phone?phone=03xxxxxxxxx
// For guest customers — just the phone number is enough to find ALL of their
// orders, no need to remember an Order ID. This keeps working even after
// delivery, so a customer can view their full order history.
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone || !phone.trim()) {
      return NextResponse.json({ message: 'Phone number is required' }, { status: 400 });
    }

    // Normalize the phone number (strip spaces/dashes) so that
    // "0342-7524477" and "03427524477" both match
    const normalizedPhone = phone.replace(/[\s-]/g, '');

    const allOrders = await Order.find({}).select(
      'phone customerName orderStatus paymentStatus total createdAt orderItems city'
    );

    const matchedOrders = allOrders
      .filter((o) => o.phone.replace(/[\s-]/g, '') === normalizedPhone)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (matchedOrders.length === 0) {
      return NextResponse.json({ message: 'No orders found for this phone number' }, { status: 404 });
    }

    return NextResponse.json(matchedOrders);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
