import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { NextResponse } from 'next/server';

// PUT /api/coupons/:id — Coupon update karo (jaise isActive toggle karna)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return NextResponse.json({ message: 'Coupon nahi mila' }, { status: 404 });
    }

    Object.keys(body).forEach((key) => {
      coupon[key] = body[key];
    });
    await coupon.save();

    return NextResponse.json(coupon);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/coupons/:id — Coupon delete karo
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) {
      return NextResponse.json({ message: 'Coupon nahi mila' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Coupon delete ho gaya' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
