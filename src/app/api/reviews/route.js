import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// GET /api/reviews — Sab reviews fetch karo (admin ke liye), product info ke sath
export async function GET(request) {
  try {
    await connectDB();
    const reviews = await Review.find({})
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/reviews — Naya review create karo (customer side se, future use ke liye)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const review = await Review.create(body);
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
