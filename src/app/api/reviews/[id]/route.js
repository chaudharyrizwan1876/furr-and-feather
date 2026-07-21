import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// Recalculate a product's rating and numReviews from its approved reviews
async function recalculateProductRating(productId) {
  const approvedReviews = await Review.find({ product: productId, isApproved: true });

  if (approvedReviews.length === 0) {
    await Product.findByIdAndUpdate(productId, { rating: 0, numReviews: 0 });
    return;
  }

  const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
  const roundedRating = Math.round(avgRating * 10) / 10;

  await Product.findByIdAndUpdate(productId, {
    rating: roundedRating,
    numReviews: approvedReviews.length,
  });
}

// PUT /api/reviews/:id — Approve or Reject a review
// The product's rating + numReviews are automatically updated on approve/reject
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    if (typeof body.isApproved === 'boolean') {
      review.isApproved = body.isApproved;
    }
    await review.save();

    // Recalculate the product's rating on approve/reject
    await recalculateProductRating(review.product);

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/reviews/:id — Delete a review
// The product's rating is also updated when a review is deleted
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);

    // Recalculate the product's rating on delete
    await recalculateProductRating(productId);

    return NextResponse.json({ message: 'Review deleted' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
