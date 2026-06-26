import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';

// GET /api/orders/:id — Single order fetch karo
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ message: 'Order nahi mila' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// PUT /api/orders/:id — Order status update karo (Admin)
export async function PUT(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ message: 'Order nahi mila' }, { status: 404 });
    }

    order.orderStatus = body.orderStatus || order.orderStatus;
    order.paymentStatus = body.paymentStatus || order.paymentStatus;

    const updatedOrder = await order.save();

    return NextResponse.json(updatedOrder);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}