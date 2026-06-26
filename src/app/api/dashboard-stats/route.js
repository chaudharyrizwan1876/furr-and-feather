import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Review from '@/models/Review';
import { NextResponse } from 'next/server';

// GET /api/dashboard-stats — Admin dashboard overview ke liye real stats
export async function GET(request) {
  try {
    await connectDB();

    const [totalProducts, totalOrders, orders, pendingOrders, lowStockProducts, pendingReviews] = await Promise.all([
      Product.countDocuments({}),
      Order.countDocuments({}),
      Order.find({}).select('customerName phone total orderItems orderStatus paymentStatus createdAt').sort({ createdAt: -1 }),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Product.find({ stock: { $lte: 5 } }).select('name stock images').limit(5),
      Review.countDocuments({ isApproved: false }),
    ]);

    // Total revenue — sab orders ke total ka sum (cancelled orders ko exclude karte hain)
    const totalRevenue = orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Unique customers (phone number se, kyunki login system abhi functional nahi hai)
    const uniquePhones = new Set(orders.map((o) => o.phone).filter(Boolean));

    // Recent 5 orders for the dashboard table
    const recentOrders = orders.slice(0, 5).map((o) => ({
      _id: o._id,
      customerName: o.customerName,
      total: o.total,
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      createdAt: o.createdAt,
      itemsCount: o.orderItems?.length || 0,
    }));

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalRevenue,
      totalCustomers: uniquePhones.size,
      pendingOrders,
      pendingReviews,
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
