import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// GET /api/reviews — Reviews fetch karo
// Query params (dono optional):
//   ?product=<productId> — sirf us product ke reviews
//   ?approved=true — sirf approved reviews (customer-facing pages ke liye)
// Bina params ke (admin use): sab reviews, sab products
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product');
    const approvedOnly = searchParams.get('approved') === 'true';

    let filter = {};
    if (productId) filter.product = productId;
    if (approvedOnly) filter.isApproved = true;

    const reviews = await Review.find(filter)
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/reviews — Customer review submit karo (guest ya logged-in dono ke liye)
// Review by default pending hoti hai (isApproved: false) — admin approve karne par hi dikhai deti hai
export async function POST(request) {
  try {
    await connectDB();
    const { productId, customerName, rating, comment } = await request.json();

    if (!productId || !customerName?.trim() || !rating || !comment?.trim()) {
      return NextResponse.json({ message: 'Sab fields zaroori hain' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating 1 se 5 ke darmiyan honi chahiye' }, { status: 400 });
    }

    // Check karein ke koi product exist karta hai
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product nahi mila' }, { status: 404 });
    }

    const review = await Review.create({
      product: productId,
      customerName: customerName.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      isApproved: false, // Admin approve karne ke baad dikhegi
    });

    return NextResponse.json({
      message: 'Shukriya! Aapka review submit ho gaya. Admin approval ke baad yeh product par dikhai dega.',
      review,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
