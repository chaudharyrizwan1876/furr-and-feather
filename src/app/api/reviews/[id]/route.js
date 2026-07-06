import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// Product ki rating aur numReviews ko approved reviews se recalculate karo
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

// PUT /api/reviews/:id — Review ko Approve ya Reject karo
// Approve/reject hone par product ki rating + numReviews automatically update hoti hai
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ message: 'Review nahi mila' }, { status: 404 });
    }

    if (typeof body.isApproved === 'boolean') {
      review.isApproved = body.isApproved;
    }
    await review.save();

    // Product ki rating recalculate karo — approve/reject hone par
    await recalculateProductRating(review.product);

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/reviews/:id — Review delete karo
// Delete hone par bhi product ki rating update hoti hai
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ message: 'Review nahi mila' }, { status: 404 });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(id);

    // Product ki rating recalculate karo — delete hone par
    await recalculateProductRating(productId);

    return NextResponse.json({ message: 'Review delete ho gaya' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
