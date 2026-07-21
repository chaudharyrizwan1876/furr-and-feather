import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// GET /api/orders — Fetch all orders (for admin)
export async function GET(request) {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/orders — Place a new order
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      user, // userId if logged in, otherwise null/undefined (guest)
      orderItems,
      customerName,
      phone,
      email,
      address,
      city,
      notes,
      paymentMethod,
      paymentScreenshot,
      subtotal,
      shippingCost,
      total,
    } = body;

    if (!customerName || !phone || !address || !city) {
      return NextResponse.json({ message: 'Please fill in all required fields' }, { status: 400 });
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ message: 'Your cart is empty' }, { status: 400 });
    }

    // Check stock (variant-specific or base product, whichever applies)
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json({ message: `Product not found: ${item.name}` }, { status: 404 });
      }

      if (item.variantId) {
        const variant = product.variants.find((v) => v._id.toString() === item.variantId.toString());
        if (!variant) {
          return NextResponse.json({ message: `Variant not found: ${item.name}` }, { status: 404 });
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json({ message: `${item.name} is low on stock. Only ${variant.stock} available.` }, { status: 400 });
        }
      } else {
        if (product.stock < item.quantity) {
          return NextResponse.json({ message: `${item.name} is low on stock. Only ${product.stock} available.` }, { status: 400 });
        }
      }
    }

    // Everything checks out — reduce stock and increase numSold (variant-specific or base product)
    for (const item of orderItems) {
      if (item.variantId) {
        const product = await Product.findById(item.product);
        const variant = product.variants.find((v) => v._id.toString() === item.variantId.toString());
        variant.stock -= item.quantity;
        product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        product.numSold = (product.numSold || 0) + item.quantity;
        await product.save();
      } else {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, numSold: item.quantity } });
      }
    }

    const order = await Order.create({
      user: user || null,
      orderItems,
      customerName,
      phone,
      email,
      address,
      city,
      notes,
      paymentMethod,
      paymentScreenshot,
      subtotal,
      shippingCost,
      total,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
