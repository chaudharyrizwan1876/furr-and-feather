import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import { NextResponse } from 'next/server';

// PUT /api/reviews/:id — Review ko Approve ya Reject (isApproved) karo
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

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/reviews/:id — Review delete karo
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) {
      return NextResponse.json({ message: 'Review nahi mila' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Review delete ho gaya' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
