import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// POST /api/orders — Order place karo (Guest ya Logged-in dono)
export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      customerId,
      customerName,
      phone,
      email,
      address,
      city,
      orderItems,
      subtotal,
      shippingCost,
      total,
      paymentMethod,
      paymentScreenshot,
      notes,
    } = body;

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json({ message: 'Order items nahi hain' }, { status: 400 });
    }

    if (!customerName || !phone || !address || !city) {
      return NextResponse.json({ message: 'Zaroori fields missing hain' }, { status: 400 });
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
        // Base stock ko bhi sync rakhte hain — variants ke total stock ka sum
        product.stock = product.variants.reduce((sum, v) => sum + v.stock, 0);
        product.numSold = (product.numSold || 0) + item.quantity;
        await product.save();
      } else {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, numSold: item.quantity } });
      }
    }

    const order = await Order.create({
      customer: customerId || null,
      customerName,
      phone,
      email,
      address,
      city,
      orderItems,
      subtotal,
      shippingCost: shippingCost || 300,
      total,
      paymentMethod,
      paymentScreenshot,
      notes,
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// GET /api/orders — Sab orders fetch karo (Admin ke liye)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let filter = {};
    if (status) filter.orderStatus = status;

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}