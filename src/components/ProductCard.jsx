'use client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import useCartStore from '@/store/useCartStore';

export function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= rating ? '#f59e0b' : '#d1d5db', fontSize: '14px' }}>★</span>
      ))}
    </div>
  );
}

export default function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const discountPercent = hasDiscount ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(47,125,58,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
    >
      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
        <div style={{ backgroundColor: 'var(--bg)', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
          {product.images && product.images[0] ? (
            <img src={product.images[0]} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '60px' }}>📦</span>
          )}
          {hasDiscount && (
            <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
              -{discountPercent}%
            </span>
          )}
        </div>
        <div style={{ padding: '16px' }}>
          <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', marginBottom: '6px', textTransform: 'uppercase' }}>{product.category}</p>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <StarRating rating={Math.floor(product.rating || 0)} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({product.numReviews || 0})</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>Rs. {(hasDiscount ? product.discountPrice : product.price).toLocaleString()}</span>
            {hasDiscount && (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>Rs. {product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
      <div style={{ padding: '0 16px 16px' }}>
        <button onClick={(e) => { e.preventDefault(); addItem(product, 1); toast.success(`${product.name} added to cart!`); }}
          disabled={!product.stock || product.stock === 0}
          className="btn-primary" style={{ width: '100%', textAlign: 'center', padding: '10px', opacity: (!product.stock || product.stock === 0) ? 0.5 : 1, cursor: (!product.stock || product.stock === 0) ? 'not-allowed' : 'pointer' }}>
          {(product.stock && product.stock > 0) ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}
