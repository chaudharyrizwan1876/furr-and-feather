import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { NextResponse } from 'next/server';

// GET /api/coupons — Sab coupons fetch karo
export async function GET(request) {
  try {
    await connectDB();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/coupons — Naya coupon create karo
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    if (!body.code || !body.discountType) {
      return NextResponse.json({ message: 'Coupon code aur discount type zaroori hai' }, { status: 400 });
    }

    const existing = await Coupon.findOne({ code: body.code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ message: 'Yeh coupon code already maujood hai' }, { status: 400 });
    }

    const coupon = await Coupon.create(body);
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
