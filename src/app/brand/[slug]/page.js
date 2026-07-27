'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft } from 'react-icons/fi';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

// Converts a brand name to a URL-friendly slug — must match the same logic
// used everywhere a brand link is generated (product detail page, etc.)
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BrandPage() {
  const params = useParams();
  const slug = params.slug;
  const addItem = useCartStore((state) => state.addItem);

  const [products, setProducts] = useState([]);
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchBrandProducts();
  }, [slug]);

  const fetchBrandProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const allProducts = await res.json();

      const matched = allProducts.filter((p) => p.brand && slugify(p.brand) === slug);

      if (matched.length === 0) {
        setNotFound(true);
        return;
      }

      setProducts(matched);
      setBrandName(matched[0].brand);
    } catch (err) {
      console.error('Failed to fetch brand products', err);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading brand products..." />;
  }

  if (notFound) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🏷️</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>Brand Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No products were found for this brand.</p>
          <Link href="/shop" className="btn-primary" style={{ display: 'inline-block', padding: '10px 24px' }}>Browse All Products</Link>
        </div>
      </div>
    );
  }

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
          {products.map((product) => {
            const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
            return (
              <Link key={product._id} href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.3s', cursor: 'pointer', height: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(46,49,146,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}>
                  <div style={{ backgroundColor: 'var(--bg)', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '48px' }}>📦</span>
                    )}
                    {hasDiscount && (
                      <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                        -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '14px' }}>
                    <p style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase' }}>{product.category}</p>
                    <h3 style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '36px' }}>{product.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                        Rs. {(hasDiscount ? product.discountPrice : product.price).toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>Rs. {product.price.toLocaleString()}</span>
                      )}
                    </div>
                    <button onClick={(e) => { e.preventDefault(); addItem(product, 1); toast.success(`${product.name} added to cart!`); }}
                      disabled={!product.stock || product.stock === 0}
                      className="btn-primary" style={{ width: '100%', textAlign: 'center', padding: '8px', fontSize: '12px', opacity: (!product.stock || product.stock === 0) ? 0.5 : 1, cursor: (!product.stock || product.stock === 0) ? 'not-allowed' : 'pointer' }}>
                      {(product.stock && product.stock > 0) ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
