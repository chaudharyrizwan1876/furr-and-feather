import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// POST /api/products/reorder — Do products ke beech order swap karo
// Body: { productId: string, direction: 'up' | 'down', field: 'sortOrder' | 'featuredOrder', category?: string }
//
// 'field' batata hai kaunsa order control ho raha hai:
//   'sortOrder'     — Shop page ka display order
//   'featuredOrder' — Home page ke "Featured Products" section ka order (sirf featured products ke beech)
export async function POST(request) {
  try {
    await connectDB();
    const { productId, direction, field, category } = await request.json();

    if (!productId || !['up', 'down'].includes(direction) || !['sortOrder', 'featuredOrder'].includes(field)) {
      return NextResponse.json({ message: 'productId, direction (up/down), aur field (sortOrder/featuredOrder) zaroori hain' }, { status: 400 });
    }

    const filter = { isActive: true };
    if (field === 'featuredOrder') filter.isFeatured = true;
    if (category) filter.category = category;

    const products = await Product.find(filter).sort({ [field]: 1, _id: 1 });

    const currentIndex = products.findIndex((p) => p._id.toString() === productId);
    if (currentIndex === -1) {
      return NextResponse.json({ message: 'Product is list mein nahi mila' }, { status: 404 });
    }

    const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= products.length) {
      return NextResponse.json({ message: 'Already at the edge' });
    }

    const current = products[currentIndex];
    const swapWith = products[swapIndex];

    const currentOrder = current[field];
    const swapOrder = swapWith[field];

    // Agar dono ka order value same hai (jaise dono 0 hon, kyunki field abhi tak
    // kisi ne set nahi kiya) to poori list ko pehle unique sequential values de dete hain,
    // taake future swaps sahi tarah kaam karein
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

    return NextResponse.json({ message: 'Order update ho gaya' });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
