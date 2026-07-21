'use client';
import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiFilter, FiX, FiArrowLeft } from 'react-icons/fi';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const categories = [
  'All', 'Dog Medicines', 'Cat Medicines', 'Cat & Dog Medicines', 'Bird Medicines',
  'Parasite Treatment', 'Deworming', 'Supplements', 'Pet Food',
  'Pain Relief & Symptomatic Care', 'Skin & External Care', 'Equipment & Devices', 'Accessories',
];

function FilterPanel({ selectedCategory, handleCategoryChange, priceRange, setPriceRange, searchQuery, setSearchQuery, sortBy, setSortBy, featuredOnly, setFeaturedOnly }) {
  return (
    <div>
      <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Categories</h3>
      <div style={{ marginBottom: '20px' }}>
        {categories.map((cat) => (
          <div key={cat} onClick={() => handleCategoryChange(cat)}
            style={{ padding: '8px 12px', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: selectedCategory === cat ? '600' : '400', backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'transparent', color: selectedCategory === cat ? 'white' : 'var(--text)', transition: 'all 0.2s' }}>
            {cat}
          </div>
        ))}
      </div>

      <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>Price Range</h3>
      <div style={{ marginBottom: '20px' }}>
        {['All', '0-1000', '1000-5000', '5000-10000', '10000-30000', '30000+'].map((range) => (
          <div key={range} onClick={() => setPriceRange(range)}
            style={{ padding: '8px 12px', borderRadius: '8px', marginBottom: '4px', cursor: 'pointer', fontSize: '14px', fontWeight: priceRange === range ? '600' : '400', backgroundColor: priceRange === range ? 'var(--primary)' : 'transparent', color: priceRange === range ? 'white' : 'var(--text)' }}>
            {range === 'All' ? 'All Prices' : range === '30000+' ? 'Rs. 30,000+' : `Rs. ${range.replace('-', ' - ')}`}
          </div>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginBottom: '20px' }}>
        <input type="checkbox" checked={featuredOnly} onChange={(e) => setFeaturedOnly(e.target.checked)} style={{ width: '16px', height: '16px' }} />
        Featured Only
      </label>

      <button onClick={() => { handleCategoryChange('All'); setPriceRange('All'); setSearchQuery(''); setSortBy('newest'); setFeaturedOnly(false); }}
        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: 'transparent', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
        Clear All Filters
      </button>
    </div>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('our-order');
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

  // Once products are loaded, if a scroll position was saved earlier (user
  // navigated back from a product page), scroll to that position so the user
  // doesn't have to scroll again every time
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

  // Save the current scroll position before a product card is clicked
  const handleProductClick = () => {
    sessionStorage.setItem('shop-scroll-position', String(window.scrollY));
  };

  // Save the category change to the URL, so the browser back button returns to the correct category
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
      const query = selectedCategory !== 'All' ? `?category=${encodeURIComponent(selectedCategory)}` : '';
      const res = await fetch(`/api/products${query}`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  let filtered = products.filter((p) => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (featuredOnly && !p.isFeatured) return false;
    if (priceRange !== 'All') {
      const price = p.discountPrice > 0 && p.discountPrice < p.price ? p.discountPrice : p.price;
      if (priceRange === '30000+') {
        if (price < 30000) return false;
      } else {
        const [min, max] = priceRange.split('-').map(Number);
        if (price < min || price > max) return false;
      }
    }
    return true;
  });

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'our-order') return (a.sortOrder || 0) - (b.sortOrder || 0) || a._id.localeCompare(b._id);
    if (sortBy === 'price-low') {
      const priceA = a.discountPrice > 0 && a.discountPrice < a.price ? a.discountPrice : a.price;
      const priceB = b.discountPrice > 0 && b.discountPrice < b.price ? b.discountPrice : b.price;
      return priceA - priceB;
    }
    if (sortBy === 'price-high') {
      const priceA = a.discountPrice > 0 && a.discountPrice < a.price ? a.discountPrice : a.price;
      const priceB = b.discountPrice > 0 && b.discountPrice < b.price ? b.discountPrice : b.price;
      return priceB - priceA;
    }
    if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });

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

      <div className="container" style={{ padding: '24px 16px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px', alignItems: 'start' }}
        data-shop-grid>
        {/* Desktop Sidebar */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', position: 'sticky', top: '16px' }}
          className="desktop-filters">
          <FilterPanel selectedCategory={selectedCategory} handleCategoryChange={handleCategoryChange} priceRange={priceRange} setPriceRange={setPriceRange} searchQuery={searchQuery} setSearchQuery={setSearchQuery} sortBy={sortBy} setSortBy={setSortBy} featuredOnly={featuredOnly} setFeaturedOnly={setFeaturedOnly} />
        </div>

        {/* Mobile Filter Button */}
        <button onClick={() => setFiltersOpen(true)}
          style={{ display: 'none', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', border: '2px solid var(--border)', backgroundColor: 'white', fontWeight: '600', fontSize: '14px', cursor: 'pointer', width: '100%', marginBottom: '4px' }}
          className="mobile-filter-btn">
          <FiFilter /> Filters & Categories
        </button>

        {/* Mobile Filter Drawer */}
        {filtersOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }} onClick={() => setFiltersOpen(false)}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '85%', maxWidth: '320px', backgroundColor: 'white', padding: '20px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: '700', fontSize: '16px' }}>Filters</h3>
                <button onClick={() => setFiltersOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={22} /></button>
              </div>
              <FilterPanel selectedCategory={selectedCategory} handleCategoryChange={handleCategoryChange} priceRange={priceRange} setPriceRange={setPriceRange} searchQuery={searchQuery} setSearchQuery={setSearchQuery} sortBy={sortBy} setSortBy={setSortBy} featuredOnly={featuredOnly} setFeaturedOnly={setFeaturedOnly} />
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px', backgroundColor: 'white' }}>
              <option value="our-order">Our Order</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{filtered.length} products</span>
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
              {filtered.map((product) => {
                const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
                return (
                  <Link key={product._id} href={`/products/${product.slug}`} onClick={handleProductClick} style={{ textDecoration: 'none' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.3s', cursor: 'pointer', height: '100%' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(46,49,146,0.15)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}>
                      <div style={{ backgroundColor: 'var(--bg)', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '40px' }}>📦</span>
                        )}
                        {hasDiscount && (
                          <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                            -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                          </span>
                        )}
                      </div>
                      <div style={{ padding: '12px' }}>
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
                        <button onClick={(e) => { e.preventDefault(); addItem(product, 1); toast.success(`${product.name} cart mein add hua!`); }}
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

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LoadingSpinner text="Loading shop..." />
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}