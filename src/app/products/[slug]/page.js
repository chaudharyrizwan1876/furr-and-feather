import Link from 'next/link';
import { notFound } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import { toPlain } from '@/lib/serialize';
import { SITE_URL } from '@/lib/site';
import { categoryUrl } from '@/lib/categories';
import BackButton from '@/components/BackButton';
import ProductView from '@/components/ProductView';

async function getProductData(slug) {
  await connectDB();
  const productDoc = await Product.findOne({ slug, isActive: true }).lean();
  if (!productDoc) return null;

  const product = toPlain(productDoc);

  const relatedDocs = await Product.find({ category: product.category, isActive: true, _id: { $ne: product._id } })
    .limit(4)
    .lean();
  const relatedProducts = toPlain(relatedDocs);

  const reviewDocs = await Review.find({ product: product._id, isApproved: true }).sort({ createdAt: -1 }).lean();
  const reviews = toPlain(reviewDocs);

  return { product, relatedProducts, reviews };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const data = await getProductData(slug);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts, reviews } = data;
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;

  // JSON-LD Product Schema for Google Rich Results
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription || product.description || '',
    image: product.images || [],
    brand: { '@type': 'Brand', name: product.brand || "Furr & Feather's Hospital" },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price: hasDiscount ? product.discountPrice : product.price,
      availability: product.stock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: "Furr & Feather's Hospital" },
    },
    ...(product.numReviews > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.numReviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  // JSON-LD FAQ Schema for Google Rich Results — generic questions that apply
  // to every product (delivery, COD, returns). Google can show these as an
  // expandable FAQ dropdown directly in search results.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Is Cash on Delivery (COD) available for this product?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, Cash on Delivery is available for same-day delivery in Rawalpindi and Islamabad. For other cities across Pakistan, online payment (Easypaisa, JazzCash, or Bank Transfer) is required in advance.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does delivery take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Orders in Rawalpindi and Islamabad are typically delivered the same day. Orders to other cities across Pakistan are usually delivered within 2 to 5 working days.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is this product genuine and authentic?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Yes, all products sold at Furr & Feather's Hospital are 100% genuine and sourced directly from authorized distributors.",
        },
      },
    ],
  };

  // JSON-LD Breadcrumb Schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
      { '@type': 'ListItem', position: 3, name: product.category, item: `${SITE_URL}${categoryUrl(product.category)}` },
      { '@type': 'ListItem', position: 4, name: product.name, item: `${SITE_URL}/products/${product.slug}` },
    ],
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* JSON-LD Schema — for Google Rich Results */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <BackButton fallback="/shop" />
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            {' → '}
            <Link href="/shop" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Shop</Link>
            {' → '}
            <Link href={categoryUrl(product.category)} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{product.category}</Link>
            {' → '}
            <span>{product.name}</span>
          </div>
        </div>
      </div>

      <ProductView product={product} relatedProducts={relatedProducts} reviews={reviews} />
    </div>
  );
}
