import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import HomeContent from '@/components/HomeContent';
import { homeCategories } from '@/lib/homeCategories';

// Stock, prices and featured/testimonial data change from the admin panel at
// any time — render this per-request instead of freezing a static snapshot
// at build time.
export const dynamic = 'force-dynamic';

// lean() gives plain objects, but ObjectId/Date fields still aren't plain
// serializable values — this strips them to strings so they can cross the
// server -> client component boundary.
function toPlain(doc) {
  return JSON.parse(JSON.stringify(doc));
}

// Server Component — fetches directly from the database so the real
// product/category content is already present in the HTML Google (and every
// other crawler) receives on the very first request, instead of appearing
// only after client-side JS fetches it.
export default async function HomePage() {
  await connectDB();

  const allProducts = await Product.find({ isActive: true }).lean();

  const categoryImages = {};
  const categoryCounts = {};
  homeCategories.forEach((cat) => {
    let productsInCat;
    if (cat.slug === 'Cat & Dog Medicines') {
      productsInCat = allProducts.filter((p) => ['Cat & Dog Medicines', 'Cat Medicines', 'Dog Medicines'].includes(p.category));
    } else {
      productsInCat = allProducts.filter((p) => p.category === cat.slug);
    }
    categoryCounts[cat.slug] = productsInCat.length;
    const withImage = productsInCat.find((p) => p.images && p.images[0]);
    if (withImage) categoryImages[cat.slug] = withImage.images[0];
  });

  // Featured products — sorted by featuredOrder, same as before.
  const featuredProducts = allProducts
    .filter((p) => p.isFeatured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0) || String(a._id).localeCompare(String(b._id)));

  // Home page testimonials — 5-star reviews first, then fill the rest (max 4).
  const allReviews = await Review.find({ isApproved: true })
    .populate('product', 'name slug images rating')
    .sort({ createdAt: -1 })
    .lean();

  const fiveStarReviews = allReviews.filter((r) => r.product?.rating === 5);
  const otherReviews = allReviews.filter((r) => r.product?.rating !== 5);
  const testimonials = [...fiveStarReviews, ...otherReviews].slice(0, 4);

  return (
    <HomeContent
      categoryImages={categoryImages}
      categoryCounts={categoryCounts}
      featuredProducts={toPlain(featuredProducts)}
      testimonials={toPlain(testimonials)}
    />
  );
}
