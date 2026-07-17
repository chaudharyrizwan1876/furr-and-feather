import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

// GET /api/orders/track-by-phone?phone=03xxxxxxxxx
// Guest customers ke liye — sirf phone number se unke SAARE orders mil jate hain,
// Order ID yaad rakhne ki zaroorat nahi. Yeh delivered orders ke baad bhi kaam
// karta rehta hai, taake customer apni poori order history dekh sake.
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone || !phone.trim()) {
      return NextResponse.json({ message: 'Phone number zaroori hai' }, { status: 400 });
    }

    // Phone number ko normalize karte hain (spaces/dashes hata kar) taake
    // "0342-7524477" aur "03427524477" dono match ho jayein
    const normalizedPhone = phone.replace(/[\s-]/g, '');

    const allOrders = await Order.find({}).select(
      'phone customerName orderStatus paymentStatus total createdAt orderItems city'
    );

    const matchedOrders = allOrders
      .filter((o) => o.phone.replace(/[\s-]/g, '') === normalizedPhone)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (matchedOrders.length === 0) {
      return NextResponse.json({ message: 'Is phone number se koi order nahi mila' }, { status: 404 });
    }

    return NextResponse.json(matchedOrders);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
