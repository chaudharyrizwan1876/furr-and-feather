'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiFilter, FiX, FiArrowLeft } from 'react-icons/fi';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const categories = ['All', 'Dog Medicines', 'Cat Medicines', 'Cat & Dog Medicines', 'Bird Medicines', 'Parasite Treatment', 'Deworming', 'Supplements', 'Pet Food', 'Pain Relief & Symptomatic Care', 'Skin & External Care', 'Equipment & Devices', 'Accessories'];

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= rating ? '#f59e0b' : '#d1d5db', fontSize: '13px' }}>★</span>
      ))}
    </div>
  );
}

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    const featuredFromUrl = searchParams.get('featured');
    setSelectedCategory(categoryFromUrl || 'All');
    setFeaturedOnly(featuredFromUrl === 'true');
    setReady(true);
  }, [searchParams]);

  useEffect(() => {
    if (ready) {
      fetchProducts();
    }
  }, [selectedCategory, sortBy, ready]);

  // Jab products load ho jayein, agar pehle se saved scroll position hai (product page se wapas aaye hain)
  // to usi jagah par scroll karo, taake user ko har baar dobara scroll na karna pare
  useEffect(() => {
    if (!loading && products.length > 0) {
      const savedScroll = sessionStorage.getItem('shop-scroll-position');
      if (savedScroll) {
        sessionStorage.removeItem('shop-scroll-position');
        requestAnimationFrame(() => {
          window.scrollTo(0, parseInt(savedScroll, 10));
        });
      }
    }
  }, [loading, products]);

  // Product card par click karne se pehle current scroll position save karo
  const handleProductClick = () => {
    sessionStorage.setItem('shop-scroll-position', String(window.scrollY));
  };

  // Category change ko URL mein save karo, taake browser back button sahi category par wapas le jaye
  const handleCategoryChange = (cat) => {
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`/shop?${params.toString()}`, { scroll: false });
    setFiltersOpen(false);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (sortBy !== 'newest') params.append('sort', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Products fetch nahi hue', err);
    } finally {
      setLoading(false);
    }
  };

  let filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFeatured = !featuredOnly || p.isFeatured;
    let matchPrice = true;
    if (priceRange === '0-1000') matchPrice = p.price <= 1000;
    if (priceRange === '1000-5000') matchPrice = p.price > 1000 && p.price <= 5000;
    if (priceRange === '5000-10000') matchPrice = p.price > 5000 && p.price <= 10000;
    if (priceRange === '10000-20000') matchPrice = p.price > 10000 && p.price <= 20000;
    if (priceRange === '20000-30000') matchPrice = p.price > 20000 && p.price <= 30000;
    if (priceRange === '30000+') matchPrice = p.price > 30000;
    return matchSearch && matchPrice && matchFeatured;
  });

  const FilterPanel = () => (
    <>
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px', color: 'var(--text)' }}>Categories</h4>
        {categories.map((cat) => (
          <div key={cat} onClick={() => handleCategoryChange(cat)}
            style={{ padding: '8px 12px', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: selectedCategory === cat ? '600' : '400', backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'transparent', color: selectedCategory === cat ? 'white' : 'var(--text)', transition: 'all 0.2s' }}>
            {cat}
          </div>
        ))}
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontWeight: '600', fontSize: '14px', marginBottom: '12px', color: 'var(--text)' }}>Price Range</h4>
        {[
          { label: 'All Prices', value: 'All' },
          { label: 'Rs. 0 - 1,000', value: '0-1000' },
          { label: 'Rs. 1,000 - 5,000', value: '1000-5000' },
          { label: 'Rs. 5,000 - 10,000', value: '5000-10000' },
          { label: 'Rs. 10,000 - 20,000', value: '10000-20000' },
          { label: 'Rs. 20,000 - 30,000', value: '20000-30000' },
          { label: 'Rs. 30,000+', value: '30000+' },
        ].map((range) => (
          <div key={range.value} onClick={() => setPriceRange(range.value)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', cursor: 'pointer' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${priceRange === range.value ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: priceRange === range.value ? 'var(--primary)' : 'white', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: 'var(--text)' }}>{range.label}</span>
          </div>
        ))}
      </div>

      <button onClick={() => { handleCategoryChange('All'); setPriceRange('All'); setSearchQuery(''); setSortBy('newest'); setFeaturedOnly(false); }}
        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'transparent', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
        Clear All Filters
      </button>
    </>
  );

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '16px 16px' }}>
        <div className="container">
          <button onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/');
            }
          }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '0', marginBottom: '10px', opacity: 0.9 }}
            className="desktop-back-btn">
            <FiArrowLeft size={15} /> Back
          </button>
          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', fontWeight: '800', marginBottom: '4px' }}>Shop</h1>
          <p style={{ opacity: 0.85, fontSize: '13px' }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
            {' → '} Shop
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '16px 12px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}
        data-shop-grid>

        {/* Mobile Filter Button */}
        <button onClick={() => setFiltersOpen(true)}
          style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: '2px solid var(--border)', backgroundColor: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', width: '100%', marginBottom: '4px' }}
          className="mobile-filter-btn">
          <FiFilter /> Filters & Categories
        </button>

        {/* Sidebar Filters - Desktop */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', position: 'sticky', top: '16px', maxHeight: 'calc(100vh - 32px)', overflowY: 'auto' }}
          className="desktop-filters">
          <h3 style={{ fontWeight: '700', fontSize: '16px', color: 'var(--primary)', marginBottom: '18px', paddingBottom: '12px', borderBottom: '2px solid var(--border)' }}>
            🔍 Filter Products
          </h3>
          <FilterPanel />
        </div>

        {/* Mobile Filter Drawer */}
        {filtersOpen && (
          <div onClick={() => setFiltersOpen(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex' }}>
            <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', width: '85%', maxWidth: '320px', height: '100%', padding: '20px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h3 style={{ fontWeight: '700', fontSize: '16px', color: 'var(--primary)' }}>🔍 Filter Products</h3>
                <button onClick={() => setFiltersOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer' }}><FiX /></button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Products Section */}
        <div style={{ minWidth: 0 }}>
          {/* Search + Sort Bar */}
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '14px', marginBottom: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: '1 1 160px', minWidth: 0, padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }}
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ flex: '0 1 auto', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '13px', cursor: 'pointer', minWidth: 0 }}>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {filtered.length} products
            </span>
          </div>

          {/* Products Grid */}
          {loading && products.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '12px' }}>
              <LoadingSpinner text="Loading products..." />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '12px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ color: 'var(--text)', marginBottom: '8px' }}>No products found</h3>
              <p style={{ color: 'var(--text-muted)' }}>Try changing your filters</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '14px', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}
              data-products-grid>
              {filtered.map((product) => (
                <Link key={product._id} href={`/products/${product.slug}`} onClick={handleProductClick} style={{ textDecoration: 'none' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.3s', cursor: 'pointer', height: '100%' }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(46,49,146,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}>

                    <div style={{ backgroundColor: 'var(--bg)', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '46px', position: 'relative', overflow: 'hidden' }}>
                      {product.images && product.images[0] ? (
                        <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span>📦</span>
                      )}
                      {!product.stock || product.stock === 0 ? (
                        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>Out of Stock</span>
                        </div>
                      ) : null}
                      {product.discountPrice > 0 && product.discountPrice > product.price && (
                        <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                          -{Math.round((1 - product.price / product.discountPrice) * 100)}%
                        </span>
                      )}
                    </div>

                    <div style={{ padding: '10px' }}>
                      <p style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{product.category}</p>
                      <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '4px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
                      {product.suitableFor && (
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>📋 {product.suitableFor}</p>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                        <StarRating rating={Math.floor(product.rating || 0)} />
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({product.numReviews || 0})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>Rs. {product.price.toLocaleString()}</span>
                        {product.discountPrice > product.price && (
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>Rs. {product.discountPrice.toLocaleString()}</span>
                        )}
                      </div>
                      <button
                        disabled={!product.stock || product.stock === 0}
                        onClick={(e) => { e.preventDefault(); addItem(product, 1); toast.success(`${product.name} cart mein add hua!`); }}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: 'none', backgroundColor: (product.stock && product.stock > 0) ? 'var(--primary)' : '#d1d5db', color: 'white', fontWeight: '600', cursor: (product.stock && product.stock > 0) ? 'pointer' : 'not-allowed', fontSize: '12px' }}>
                        {(product.stock && product.stock > 0) ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          [data-shop-grid] {
            grid-template-columns: 1fr !important;
          }
          .mobile-filter-btn {
            display: flex !important;
          }
          .desktop-filters {
            display: none !important;
          }
          .desktop-back-btn {
            display: none !important;
          }
        }
        @media (max-width: 480px) {
          [data-products-grid] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}