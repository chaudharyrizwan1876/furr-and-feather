import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import ProductClient from './ProductClient';

// Stock, price and reviews change from the admin panel at any time — render
// this per-request instead of freezing a static snapshot at build time.
export const dynamic = 'force-dynamic';

function toPlain(doc) {
  return JSON.parse(JSON.stringify(doc));
}

// Server Component — fetches the product, its related products and its
// approved reviews straight from the database, so the real content (name,
// price, description, reviews, JSON-LD schema) is already present in the
// first HTML response instead of appearing only after client-side JS fetches
// it. This is what lets individual medicine pages actually get indexed and
// ranked well.
export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  await connectDB();

  const product = await Product.findOne({ slug, isActive: true }).lean();

  if (!product) {
    return <ProductClient product={null} relatedProducts={[]} reviews={[]} />;
  }

  const [relatedRaw, reviewsRaw] = await Promise.all([
    Product.find({ category: product.category, isActive: true, _id: { $ne: product._id } })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean(),
    Review.find({ product: product._id, isApproved: true }).sort({ createdAt: -1 }).lean(),
  ]);

  return (
    <ProductClient
      product={toPlain(product)}
      relatedProducts={toPlain(relatedRaw)}
      reviews={toPlain(reviewsRaw)}
    />
  );
}
