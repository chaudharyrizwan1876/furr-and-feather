import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// GET /api/products/:id — Single product fetch karo
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ message: 'Product nahi mila' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/products/:id — Product update karo (Admin)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ message: 'Product nahi mila' }, { status: 404 });
    }

    Object.keys(body).forEach((key) => {
      product[key] = body[key];
    });

    const updatedProduct = await product.save();

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// DELETE /api/products/:id — Product delete karo (Admin)
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ message: 'Product nahi mila' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Product delete ho gaya' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}