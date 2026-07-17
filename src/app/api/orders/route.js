import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// GET /api/orders — Sab orders fetch karo (admin ke liye)
export async function GET(request) {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// POST /api/orders — Naya order place karo
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const {
      user, // logged-in ho to userId, warna null/undefined (guest)
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
      return NextResponse.json({ message: 'Sab zaroori fields bharein' }, { status: 400 });
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ message: 'Cart khali hai' }, { status: 400 });
    }

    // Stock check karo (variant-specific ya base product, jo bhi applicable ho)
    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (!product) {
        return NextResponse.json({ message: `Product nahi mila: ${item.name}` }, { status: 404 });
      }

      if (item.variantId) {
        const variant = product.variants.find((v) => v._id.toString() === item.variantId.toString());
        if (!variant) {
          return NextResponse.json({ message: `Variant nahi mila: ${item.name}` }, { status: 404 });
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json({ message: `${item.name} ka stock kam hai. Sirf ${variant.stock} available hai.` }, { status: 400 });
        }
      } else {
        if (product.stock < item.quantity) {
          return NextResponse.json({ message: `${item.name} ka stock kam hai. Sirf ${product.stock} available hai.` }, { status: 400 });
        }
      }
    }

    // Sab theek hai to stock kam karo aur numSold barhao (variant-specific ya base product)
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
