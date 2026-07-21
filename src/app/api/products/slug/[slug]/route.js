import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// GET /api/products/slug/:slug — Fetch a product by its slug (for the customer-facing side)
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { slug } = await params;
    const product = await Product.findOne({ slug: slug, isActive: true });

    if (!product) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
