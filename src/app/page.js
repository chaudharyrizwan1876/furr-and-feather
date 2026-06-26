'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiShield, FiTruck, FiCreditCard, FiCheckCircle, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const categories = [
  { name: 'Dog Medicines', slug: 'Dog Medicines', fallbackIcon: '🐕' },
  { name: 'Cat Medicines', slug: 'Cat Medicines', fallbackIcon: '🐈' },
  { name: 'Cat & Dog Medicines', slug: 'Cat & Dog Medicines', fallbackIcon: '🐾' },
  { name: 'Bird Medicines', slug: 'Bird Medicines', fallbackIcon: '🦜' },
  { name: 'Parasite Treatment', slug: 'Parasite Treatment', fallbackIcon: '💊' },
  { name: 'Deworming', slug: 'Deworming', fallbackIcon: '💊' },
  { name: 'Supplements', slug: 'Supplements', fallbackIcon: '💊' },
  { name: 'Pet Food', slug: 'Pet Food', fallbackIcon: '🍖' },
  { name: 'Pain Relief & Symptomatic Care', slug: 'Pain Relief & Symptomatic Care', fallbackIcon: '💉' },
  { name: 'Skin & External Care', slug: 'Skin & External Care', fallbackIcon: '🧴' },
  { name: 'Equipment & Devices', slug: 'Equipment & Devices', fallbackIcon: '🔧' },
  { name: 'Accessories', slug: 'Accessories', fallbackIcon: '🎾' },
];

const trustBadges = [
  { icon: <FiShield size={28} />, title: 'Genuine Products', desc: 'Trusted and Certified' },
  { icon: <FiTruck size={28} />, title: 'Cash on Delivery', desc: 'Rawalpindi and Islamabad' },
  { icon: <FiCreditCard size={28} />, title: 'Secure Payments', desc: 'EasyPaisa, JazzCash and Bank' },
  { icon: <FiTruck size={28} />, title: 'Fast Delivery', desc: 'Quick and Reliable' },
];

const whyChooseUs = [
  { icon: <FiCheckCircle size={36} />, title: '100% Genuine Products', desc: 'All medicines are sourced directly from authorized distributors' },
  { icon: <FiTruck size={36} />, title: 'Fast Delivery', desc: 'We deliver all over Pakistan within 2 to 5 working days' },
  { icon: <FiCreditCard size={36} />, title: 'Cash on Delivery', desc: 'Pay when you receive your order, no advance payment needed' },
  { icon: <FiHeart size={36} />, title: 'Vet Recommended', desc: 'Products recommended by certified veterinary doctors' },
];

const testimonials = [
  { name: 'Ali Raza', city: 'Lahore', review: 'Bravecto original mila, delivery bhi fast thi. Bahut khush hoon!', rating: 5 },
  { name: 'Sana Khan', city: 'Karachi', review: 'Genuine products milte hain yahan. Meri billi ke liye best supplements order kiye.', rating: 5 },
  { name: 'Usman Iqbal', city: 'Islamabad', review: 'COD ka option bahut acha hai. Trust karne wali shop hai.', rating: 4 },
];

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= rating ? '#f59e0b' : '#d1d5db', fontSize: '14px' }}>★</span>
      ))}
    </div>
  );
}

function ProductCard({ product, addItem }) {
  const hasDiscount = product.discountPrice > product.price;
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(47,125,58,0.15)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
    >
      <Link href={`/products/${product.slug}`} style={{ textDecoration: 'none' }}>
        <div style={{ backgroundColor: 'var(--bg)', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
          {product.images && product.images[0] ? (
            <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '60px' }}>📦</span>
          )}
          {hasDiscount && (
            <span style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
              -{Math.round((1 - product.price / product.discountPrice) * 100)}%
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
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>Rs. {product.price.toLocaleString()}</span>
            {hasDiscount && (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through' }}>Rs. {product.discountPrice.toLocaleString()}</span>
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

export default function HomePage() {
  const addItem = useCartStore((state) => state.addItem);
  const [categoryImages, setCategoryImages] = useState({});
  const [categoryCounts, setCategoryCounts] = useState({});
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      const allRes = await fetch('/api/products');
      const allProducts = await allRes.json();

      const images = {};
      const counts = {};
      categories.forEach((cat) => {
        let productsInCat;
        if (cat.slug === 'Cat & Dog Medicines') {
          productsInCat = allProducts.filter((p) => ['Cat & Dog Medicines', 'Cat Medicines', 'Dog Medicines'].includes(p.category));
        } else {
          productsInCat = allProducts.filter((p) => p.category === cat.slug);
        }
        counts[cat.slug] = productsInCat.length;
        const withImage = productsInCat.find((p) => p.images && p.images[0]);
        if (withImage) images[cat.slug] = withImage.images[0];
      });
      setCategoryImages(images);
      setCategoryCounts(counts);

      const featured = allProducts.filter((p) => p.isFeatured);
      setFeaturedProducts(featured.slice(0, 8));
    } catch (err) {
      console.error('Home data fetch nahi hui', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* ===== HERO SECTION ===== */}
      <section style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', color: 'white', padding: '80px 20px', position: 'relative', overflow: 'hidden' }}
        data-hero-section>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '400px', height: '400px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }} />

        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', position: 'relative', zIndex: 1 }}
          data-hero-grid>
          <div>
            <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', marginBottom: '20px', display: 'inline-block' }}>
              Trusted Veterinary Store
            </span>
            <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px' }}>
              Quality Medicines and Care For Your Pets
            </h1>
            <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', opacity: 0.9, lineHeight: '1.7', marginBottom: '32px' }}>
              Trusted veterinary medicines, supplements and pet care products at your doorstep. Genuine products, fast delivery all over Pakistan.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/shop" className="btn-primary" style={{ backgroundColor: 'white', color: 'var(--primary)', fontWeight: '700' }}>
                Shop Now
              </Link>
              <Link href="/contact" className="btn-outline" style={{ borderColor: 'white', color: 'white' }}>
                Contact Us
              </Link>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', transform: 'scale(1.15)' }}
            data-hero-image-wrap>
            <Image
              src="/pets-hero.png"
              alt="Happy pets at Furr & Feather's Hospital"
              width={1100}
              height={1100}
              style={{ width: '100%', maxWidth: '950px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.15))' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* ===== TRUST BADGES ===== */}
      <section style={{ backgroundColor: 'white', padding: '30px 20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {trustBadges.map((badge, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px' }}>
              <div style={{ color: 'var(--primary)', flexShrink: 0 }}>{badge.icon}</div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text)' }}>{badge.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{badge.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES SECTION ===== */}
      <section style={{ padding: '60px 20px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 className="section-title">Shop By Category</h2>
              <p className="section-subtitle">Find the right products for your pet</p>
            </div>
            <Link href="/shop" className="btn-outline" style={{ padding: '10px 20px', fontSize: '14px' }}>View All</Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}
            data-category-grid>
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/shop?category=${encodeURIComponent(cat.slug)}`} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px 14px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.3s', cursor: 'pointer', border: '2px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {categoryImages[cat.slug] ? (
                      <img src={categoryImages[cat.slug]} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '30px' }}>{cat.fallbackIcon}</span>
                    )}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text)', marginBottom: '4px' }}>{cat.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{categoryCounts[cat.slug] || 0} Products</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section style={{ padding: '20px 20px 60px', backgroundColor: 'var(--bg)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Hand picked products recommended by our team</p>
            </div>
            <Link href="/shop?featured=true" className="btn-outline" style={{ padding: '10px 20px', fontSize: '14px' }}>View All</Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading featured products..." />
          ) : featuredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', color: 'var(--text-muted)' }}>
              No featured products yet. Mark products as featured from the admin panel.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} addItem={addItem} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">Why Choose Us</h2>
          <p className="section-subtitle">We are Pakistan's trusted veterinary online store</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginTop: '20px' }}>
            {whyChooseUs.map((item, i) => (
              <div key={i} style={{ padding: '28px 20px', borderRadius: '12px', backgroundColor: 'var(--bg)', border: '1px solid var(--border)' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>{item.icon}</div>
                <h3 style={{ fontWeight: '700', fontSize: '16px', color: 'var(--primary)', marginBottom: '10px' }}>{item.title}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHATSAPP BANNER ===== */}
      <section style={{ backgroundColor: '#25D366', padding: '30px 20px' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ color: 'white' }}>
            <h3 style={{ fontWeight: '700', fontSize: '20px', marginBottom: '6px' }}>Need Help? Chat with our Pet Care Experts</h3>
            <p style={{ opacity: 0.9, fontSize: '14px' }}>Available 9 AM to 9 PM, Monday to Saturday</p>
          </div>
          <a href="https://wa.me/923001234567" target="_blank" style={{ backgroundColor: 'white', color: '#25D366', padding: '12px 28px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaWhatsapp size={18} /> Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section style={{ padding: '60px 20px', backgroundColor: 'var(--bg)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">Thousands of happy pet owners trust us</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'left' }}>
                <StarRating rating={t.rating} />
                <p style={{ color: 'var(--text)', lineHeight: '1.7', margin: '14px 0', fontSize: '14px' }}>"{t.review}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ backgroundColor: 'var(--primary)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px' }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{t.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @media (max-width: 968px) {
          [data-category-grid] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          [data-hero-grid] {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          [data-hero-grid] > div:first-child > div {
            justify-content: center;
            display: flex;
          }
          [data-hero-image-wrap] {
            transform: scale(1) !important;
            order: -1;
          }
        }
        @media (max-width: 600px) {
          [data-category-grid] {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          [data-hero-section] {
            padding: 40px 16px !important;
          }
        }
      `}</style>
    </main>
  );
}