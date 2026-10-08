import { Suspense } from 'react';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import ShopClient from './ShopClient';
import LoadingSpinner from '@/components/LoadingSpinner';

// Product list/stock changes from the admin panel at any time — render this
// per-request instead of freezing a static snapshot at build time.
export const dynamic = 'force-dynamic';

function toPlain(doc) {
  return JSON.parse(JSON.stringify(doc));
}

async function getInitialProducts(category) {
  await connectDB();

  let filter = { isActive: true };
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

// Server Component — fetches the correct category's products straight from
// the database based on the URL's search params, so the first HTML response
// for any /shop?category=... link already has real products in it (instead
// of an empty shell that only fills in after client-side JS fetches data).
export default async function ShopPage({ searchParams }) {
  const sp = await searchParams;
  const category = sp?.category || null;
  const featured = sp?.featured === 'true';

  const initialProducts = await getInitialProducts(category);

  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner text="Loading shop..." />
        </div>
      }
    >
      <ShopClient
        initialProducts={initialProducts}
        initialCategory={category || 'All'}
        initialFeatured={featured}
      />
    </Suspense>
  );
}
