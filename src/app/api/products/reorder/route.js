import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// POST /api/products/reorder — Swap the order between two products
// Body: { productId: string, direction: 'up' | 'down', field: 'sortOrder' | 'featuredOrder', category?: string }
//
// 'field' indicates which order is being controlled:
//   'sortOrder'     — Shop page display order
//   'featuredOrder' — Home page "Featured Products" section order (only among featured products)
export async function POST(request) {
  try {
    await connectDB();
    const { productId, direction, field, category } = await request.json();

    if (!productId || !['up', 'down'].includes(direction) || !['sortOrder', 'featuredOrder'].includes(field)) {
      return NextResponse.json({ message: 'productId, direction (up/down), and field (sortOrder/featuredOrder) are required' }, { status: 400 });
    }

    const filter = { isActive: true };
    if (field === 'featuredOrder') filter.isFeatured = true;
    if (category) filter.category = category;

    const products = await Product.find(filter).sort({ [field]: 1, _id: 1 });

    const currentIndex = products.findIndex((p) => p._id.toString() === productId);
    if (currentIndex === -1) {
      return NextResponse.json({ message: 'Product not found in this list' }, { status: 404 });
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= products.length) {
      return NextResponse.json({ message: 'Already at the edge' });
    }

    const current = products[currentIndex];
    const swapWith = products[swapIndex];

    const currentOrder = current[field];
    const swapOrder = swapWith[field];

    // If both order values are the same (e.g. both 0, because no one has set
    // the field yet), assign unique sequential values to the whole list first,
    // so future swaps work correctly
    if (currentOrder === swapOrder) {
      for (let i = 0; i < products.length; i++) {
        products[i][field] = i;
        await products[i].save();
      }
      const newCurrent = products[currentIndex];
      const newSwapWith = products[swapIndex];
      const tempOrder = newCurrent[field];
      newCurrent[field] = newSwapWith[field];
      newSwapWith[field] = tempOrder;
      await newCurrent.save();
      await newSwapWith.save();
    } else {
      current[field] = swapOrder;
      swapWith[field] = currentOrder;
      await current.save();
      await swapWith.save();
    }

    return NextResponse.json({ message: 'Order updated' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
