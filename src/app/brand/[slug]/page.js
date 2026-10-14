import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import { toPlain } from '@/lib/serialize';
import { slugify } from '@/lib/slugify';
import ProductCard from '@/components/ProductCard';

async function getBrandProducts(slug) {
  await connectDB();
  const allProducts = toPlain(await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean());
  const matched = allProducts.filter((p) => p.brand && slugify(p.brand) === slug);
  if (matched.length === 0) return null;
  return { products: matched, brandName: matched[0].brand };
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const data = await getBrandProducts(slug);

  if (!data) {
    notFound();
  }

  const { products, brandName } = data;

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '30px 16px' }}>
        <div className="container">
          <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: '600', marginBottom: '10px', opacity: 0.9 }}>
            <FiArrowLeft size={15} /> Back to Shop
          </Link>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: '800', marginBottom: '4px' }}>{brandName} Products in Pakistan</h1>
          <p style={{ opacity: 0.85, fontSize: '13px' }}>{products.length} genuine {brandName} product{products.length !== 1 ? 's' : ''} available — Cash on Delivery in Rawalpindi & Islamabad</p>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
