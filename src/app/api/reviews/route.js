import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/requireAdmin';
import { NextResponse } from 'next/server';

// GET /api/reviews — Fetch reviews
// Query params (both optional):
//   ?product=<productId> — only reviews for that product
//   ?approved=true — only approved reviews (for customer-facing pages)
// Without params (admin use): all reviews, all products — including unapproved ones, so this case requires admin
export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product');
    const approvedOnly = searchParams.get('approved') === 'true';

    if (!productId && !approvedOnly) {
      const session = await requireAdmin();
      if (!session) {
        return NextResponse.json({ message: 'Admin login required' }, { status: 401 });
      }
    }

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

// POST /api/reviews — Submit a customer review (works for both guest and logged-in users)
// Reviews are pending by default (isApproved: false) — only shown once approved by an admin
export async function POST(request) {
  try {
    await connectDB();
    const { productId, customerName, rating, comment } = await request.json();

    if (!productId || !customerName?.trim() || !rating || !comment?.trim()) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check that the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    const review = await Review.create({
      product: productId,
      customerName: customerName.trim(),
      rating: Number(rating),
      comment: comment.trim(),
      isApproved: false, // Will show once approved by an admin
    });

    return NextResponse.json({
      message: 'Thank you! Your review has been submitted and will appear on the product page once approved.',
      review,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
