import Link from 'next/link';
import Image from 'next/image';
import { FiShield, FiTruck, FiCreditCard, FiCheckCircle, FiHeart } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import { toPlain } from '@/lib/serialize';
import ProductCard, { StarRating } from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { CATEGORIES } from '@/lib/categories';

// Cache the rendered page for 60 seconds instead of hitting the database on
// every single visit (force-dynamic) — admin changes (new products, featured
// order, approved reviews) still show up within a minute, but most visitors
// get an instant cached response instead of waiting on a fresh DB query.
export const revalidate = 60;

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

// Runs on the server for every request — the HTML Google receives already
// contains the real categories, featured products and testimonials instead
// of an empty shell that only fills in after client-side JS fetches data.
async function getHomeData() {
  await connectDB();

  const allProducts = toPlain(await Product.find({ isActive: true }).sort({ createdAt: -1 }).lean());

  const categoryImages = {};
  const categoryCounts = {};
  CATEGORIES.forEach((cat) => {
    let productsInCat;
    if (cat.combined) {
      productsInCat = allProducts.filter((p) => ['Cat & Dog Medicines', 'Cat Medicines', 'Dog Medicines'].includes(p.category));
    } else {
      productsInCat = allProducts.filter((p) => p.category === cat.name);
    }
    categoryCounts[cat.name] = productsInCat.length;
    const withImage = productsInCat.find((p) => p.images && p.images[0]);
    if (withImage) categoryImages[cat.name] = withImage.images[0];
  });

  // Featured products — sorted by featuredOrder, set in the admin panel
  // (Products > Featured Products Order tab). Lower number shows first.
  const featuredProducts = allProducts
    .filter((p) => p.isFeatured)
    .sort((a, b) => (a.featuredOrder || 0) - (b.featuredOrder || 0) || a._id.localeCompare(b._id));

  // Testimonials — approved reviews, 5-star products first, then the rest (max 4)
  const allReviews = toPlain(
    await Review.find({ isApproved: true }).populate('product', 'name slug rating').sort({ createdAt: -1 }).lean()
  );
  const fiveStarReviews = allReviews.filter((r) => r.product?.rating === 5);
  const otherReviews = allReviews.filter((r) => r.product?.rating !== 5);
  const testimonials = [...fiveStarReviews, ...otherReviews].slice(0, 4);

  return { categoryImages, categoryCounts, featuredProducts, testimonials };
}

export default async function HomePage() {
  const { categoryImages, categoryCounts, featuredProducts, testimonials } = await getHomeData();

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
              src="/petsss.png"
              alt="Happy pets at Furr & Feather's Hospital"
              width={1100}
              height={1100}
              style={{
                width: '100%',
                maxWidth: '950px',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 15px 35px rgba(0,0,0,0.15))',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 6%, black 16%)',
                maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 6%, black 16%)',
              }}
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
            {CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.slug}
                href={`/shop/${cat.slug}`}
                image={categoryImages[cat.name]}
                icon={cat.icon}
                name={cat.name}
                count={categoryCounts[cat.name] || 0}
              />
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

          {featuredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px', color: 'var(--text-muted)' }}>
              No featured products yet. Mark products as featured from the admin panel.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px' }}
              data-featured-grid>
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
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
          <a href="https://wa.me/923295780676" target="_blank" style={{ backgroundColor: 'white', color: '#25D366', padding: '12px 28px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaWhatsapp size={18} /> Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {testimonials.length > 0 && (
        <section style={{ padding: '60px 20px', backgroundColor: 'var(--bg)' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Thousands of happy pet owners trust us</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '20px' }}>
              {testimonials.map((t) => (
                <div key={t._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', textAlign: 'left' }}>
                  <StarRating rating={t.rating} />
                  <p style={{ color: 'var(--text)', lineHeight: '1.7', margin: '14px 0', fontSize: '14px' }}>"{t.comment}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ backgroundColor: 'var(--primary)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0 }}>
                      {t.customerName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14px' }}>{t.customerName}</div>
                      {t.product?.name && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>on {t.product.name}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 1200px) {
          [data-featured-grid] {
            grid-template-columns: repeat(4, 1fr) !important;
          }
        }
        @media (max-width: 968px) {
          [data-category-grid] {
            grid-template-columns: repeat(3, 1fr) !important;
          }
          [data-featured-grid] {
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
          [data-featured-grid] {
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
