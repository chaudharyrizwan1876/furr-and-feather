import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { toPlain } from '@/lib/serialize';
import ShopView from '@/components/ShopView';

async function getProducts(category) {
  await connectDB();
  const filter = { isActive: true };
  if (category) {
    if (category === 'Cat & Dog Medicines') {
      filter.category = { $in: ['Cat & Dog Medicines', 'Cat Medicines', 'Dog Medicines'] };
    } else {
      filter.category = category;
    }
  }
  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  return toPlain(products);
}

export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category || 'All';
  const featured = sp?.featured === 'true';

  const products = await getProducts(category !== 'All' ? category : undefined);

  return <ShopView initialProducts={products} initialCategory={category} initialFeatured={featured} />;
}
