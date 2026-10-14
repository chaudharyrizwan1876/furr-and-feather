import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { toPlain } from '@/lib/serialize';
import { categoryUrl } from '@/lib/categories';
import ShopView from '@/components/ShopView';

async function getAllProducts() {
  await connectDB();
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return toPlain(products);
}

export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;

  // Old-style links (?category=Dog+Medicines) now have a dedicated URL at
  // /shop/[category] — redirect so there's one canonical URL per category
  // instead of two different ones with the same content.
  if (sp?.category) {
    const url = categoryUrl(sp.category);
    redirect(url !== '/shop' ? `${url}${sp.featured === 'true' ? '?featured=true' : ''}` : '/shop');
  }

  const featured = sp?.featured === 'true';
  const products = await getAllProducts();

  return <ShopView initialProducts={products} initialCategory="All" initialFeatured={featured} />;
}
