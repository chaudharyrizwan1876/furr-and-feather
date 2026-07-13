'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import useCartStore from '@/store/useCartStore';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

function StarRating({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} style={{ color: star <= rating ? '#f59e0b' : '#d1d5db', fontSize: '16px' }}>★</span>
      ))}
    </div>
  );
}

export default function ProductDetailPage({ params }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const { slug } = use(params);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Review form state
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 0, comment: '' });
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [slug]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/slug/${slug}`);
      if (!res.ok) {
        setProduct(null);
        return;
      }
      const data = await res.json();
      setProduct(data);
      if (data.variants && data.variants.length > 0) {
        setSelectedVariant(data.variants[0]);
      }

      // Related products — same category se fetch karo
      const relatedRes = await fetch(`/api/products?category=${encodeURIComponent(data.category)}`);
      const relatedData = await relatedRes.json();
      setRelatedProducts(relatedData.filter(p => p._id !== data._id).slice(0, 4));

      // Is product ke approved reviews fetch karo
      const reviewsRes = await fetch(`/api/reviews?product=${data._id}&approved=true`);
      const reviewsData = await reviewsRes.json();
      setReviews(reviewsData);
    } catch (err) {
      console.error('Product fetch nahi hua', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner text="Loading product details..." />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>📦</div>
        <h2 style={{ color: 'var(--text)', marginBottom: '8px' }}>Product nahi mila</h2>
        <Link href="/shop" className="btn-primary" style={{ marginTop: '16px' }}>Shop Par Wapas Jao</Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : null;

  // Yeh sab product ke available hone ke BAAD define hote hain
  // (upar product null tha to crash hota tha — yeh wahi bug fix hy)
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const getActivePrice = () => {
    if (selectedVariant) return selectedVariant.price;
    return hasDiscount ? product.discountPrice : product.price;
  };
  const getActiveStock = () => selectedVariant ? selectedVariant.stock : product.stock;

  // Google Rich Results ke liye JSON-LD Product Schema
  // NOTE: yeh hasDiscount/getActiveStock ke BAAD hona zaroori hai, warna
  // "Cannot access before initialization" error aata hai
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
      availability: getActiveStock() > 0
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

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariant);
    const label = selectedVariant ? `${product.name} (${selectedVariant.label})` : product.name;
    setAdded(true);
    toast.success(`${label} added to cart!`);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addItem(product, quantity, selectedVariant);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    if (!reviewForm.name.trim()) { setReviewError('Apna naam likhein'); return; }
    if (reviewForm.rating === 0) { setReviewError('Rating zaroor select karein'); return; }
    if (!reviewForm.comment.trim()) { setReviewError('Review likhein'); return; }

    setReviewSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          customerName: reviewForm.name.trim(),
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.message || 'Review submit nahi hua');
        return;
      }
      setReviewSubmitted(true);
      setReviewForm({ name: '', rating: 0, comment: '' });
    } catch (err) {
      setReviewError('Kuch ghalat ho gaya, dobara koshish karein');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* JSON-LD Schema — Google Rich Results ke liye */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <button onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/shop');
            }
          }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '0', marginBottom: '10px' }}>
            <FiArrowLeft size={15} /> Back
          </button>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', overflowX: 'auto', whiteSpace: 'nowrap' }}>
            <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            {' → '}
            <Link href="/shop" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Shop</Link>
            {' → '}
            <Link href={`/shop?category=${encodeURIComponent(product.category)}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{product.category}</Link>
            {' → '}
            <span>{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '20px 16px' }}>
        {/* Product Top Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '24px' }}
          data-product-grid>

          {/* Images */}
          <div>
            <div style={{ backgroundColor: 'var(--bg)', borderRadius: '12px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '90px', marginBottom: '14px', overflow: 'hidden' }}>
              {images ? (
                <img src={images[selectedImage]} alt={product.name} loading="eager" fetchPriority="high" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>📦</span>
              )}
            </div>
            {images && images.length > 1 && (
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImage(i)}
                    style={{ width: '64px', height: '64px', backgroundColor: 'var(--bg)', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: `2px solid ${selectedImage === i ? 'var(--primary)' : 'var(--border)'}` }}>
                    <img src={img} alt={`${product.name} view ${i + 1}`} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '8px' }}>{product.category}</p>
            <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', fontWeight: '800', color: 'var(--text)', marginBottom: '12px', lineHeight: '1.3' }}>{product.name}</h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <StarRating rating={Math.floor(product.rating || 0)} />
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>({product.numReviews || 0} Reviews)</span>
              {product.numSold > 0 && (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', backgroundColor: 'var(--bg)', padding: '3px 10px', borderRadius: '20px' }}>
                  {product.numSold}+ sold
                </span>
              )}
            </div>

            {product.shortDescription && (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>{product.shortDescription}</p>
            )}

            {product.suitableFor && (
              <div style={{ backgroundColor: '#f0f1ff', border: '1px solid var(--primary)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>📋</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>Suitable for: {product.suitableFor}</span>
              </div>
            )}

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: 'var(--text)', marginBottom: '10px' }}>
                  Select Weight/Size:
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {product.variants.map((variant, i) => (
                    <button key={i} onClick={() => { setSelectedVariant(variant); setQuantity(1); }}
                      style={{
                        padding: '10px 16px', borderRadius: '8px',
                        border: `2px solid ${selectedVariant?.label === variant.label ? 'var(--primary)' : 'var(--border)'}`,
                        backgroundColor: selectedVariant?.label === variant.label ? '#f0f1ff' : 'white',
                        cursor: variant.stock > 0 ? 'pointer' : 'not-allowed',
                        opacity: variant.stock > 0 ? 1 : 0.5,
                        textAlign: 'left',
                      }}
                      disabled={variant.stock === 0}>
                      <div style={{ fontWeight: '700', fontSize: '13px', color: selectedVariant?.label === variant.label ? 'var(--primary)' : 'var(--text)' }}>{variant.label}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rs. {variant.price.toLocaleString()}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)' }}>Rs. {getActivePrice().toLocaleString()}</span>
              {!selectedVariant && hasDiscount && (
                <span style={{ fontSize: '1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>Rs. {product.price.toLocaleString()}</span>
              )}
              {!selectedVariant && hasDiscount && (
                <span style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '4px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' }}>
                  -{Math.round((1 - product.discountPrice / product.price) * 100)}% OFF
                </span>
              )}
            </div>

            {/* Stock */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ backgroundColor: getActiveStock() > 0 ? '#f0fdf4' : '#fef2f2', color: getActiveStock() > 0 ? '#16a34a' : '#ef4444', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>
                {getActiveStock() > 0 ? `✓ In Stock (${getActiveStock()} available)` : '✗ Out of Stock'}
              </span>
            </div>

            {/* SKU & Unit */}
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {product.sku && <span>SKU: <strong>{product.sku}</strong></span>}
              {product.unit && <span>Unit: <strong>{product.unit}</strong></span>}
              {product.brand && <span>Brand: <strong>{product.brand}</strong></span>}
            </div>

            {/* Quantity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '8px 16px', border: 'none', backgroundColor: 'var(--bg)', cursor: 'pointer', fontSize: '18px', fontWeight: '700' }}>-</button>
                <span style={{ padding: '8px 20px', fontWeight: '700', fontSize: '16px' }}>{quantity}</span>
                <button onClick={() => setQuantity(Math.min(getActiveStock(), quantity + 1))}
                  style={{ padding: '8px 16px', border: 'none', backgroundColor: 'var(--bg)', cursor: 'pointer', fontSize: '18px', fontWeight: '700' }}>+</button>
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <button onClick={handleAddToCart} disabled={getActiveStock() === 0}
                style={{ flex: '1 1 140px', padding: '14px', borderRadius: '8px', border: '2px solid var(--primary)', backgroundColor: added ? 'var(--primary)' : 'transparent', color: added ? 'white' : 'var(--primary)', fontWeight: '700', cursor: getActiveStock() === 0 ? 'not-allowed' : 'pointer', fontSize: '15px', transition: 'all 0.3s', opacity: getActiveStock() === 0 ? 0.5 : 1 }}>
                {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
              </button>
              <button onClick={handleBuyNow} disabled={getActiveStock() === 0}
                style={{ flex: '1 1 140px', padding: '14px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '700', cursor: getActiveStock() === 0 ? 'not-allowed' : 'pointer', fontSize: '15px', opacity: getActiveStock() === 0 ? 0.5 : 1 }}>
                ⚡ Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', padding: '14px', backgroundColor: 'var(--bg)', borderRadius: '10px' }}>
              {['💵 Cash on Delivery', '↩️ Easy Returns', '✅ Genuine Products', '👨‍⚕️ Vet Approved'].map((badge) => (
                <span key={badge} style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500' }}>{badge}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid var(--border)', overflowX: 'auto' }}>
            {[
              { key: 'description', label: 'Description' },
              { key: 'reviews', label: `Reviews (${product.numReviews || 0})` },
            ].map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: '12px 16px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', borderBottom: activeTab === tab.key ? '3px solid var(--primary)' : '3px solid transparent', color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)', backgroundColor: 'transparent', transition: 'all 0.2s', marginBottom: '-2px', whiteSpace: 'nowrap' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <p style={{ color: 'var(--text)', lineHeight: '1.8', fontSize: '15px' }}>{product.description}</p>
          )}
          {activeTab === 'reviews' && (
            <div>
              {/* Existing reviews list */}
              {reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
                  <p>Abhi koi review nahi hai — pehle review likhne wale banein!</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
                  {reviews.map((review) => (
                    <div key={review._id} style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '700', fontSize: '14px' }}>{review.customerName}</span>
                        <StarRating rating={review.rating} />
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.7' }}>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Review Submit Form */}
              <div style={{ borderTop: reviews.length > 0 ? '2px solid var(--border)' : 'none', paddingTop: reviews.length > 0 ? '24px' : '0' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', marginBottom: '16px' }}>
                  ✍️ Apna Review Likhen
                </h4>

                {reviewSubmitted ? (
                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '18px', textAlign: 'center' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
                    <p style={{ fontWeight: '700', color: '#166534', marginBottom: '4px' }}>Shukriya aapke review ke liye!</p>
                    <p style={{ fontSize: '13px', color: '#166534' }}>Aapka review admin approval ke baad is product par dikhai dega.</p>
                    <button onClick={() => setReviewSubmitted(false)}
                      style={{ marginTop: '12px', fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      Aur ek review likhein
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {reviewError && (
                      <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px' }}>
                        {reviewError}
                      </div>
                    )}

                    {/* Name field */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text)' }}>
                        Aapka Naam *
                      </label>
                      <input type="text" value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        placeholder="Apna naam likhein"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
                    </div>

                    {/* Star Rating Selector */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: 'var(--text)' }}>
                        Rating *
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span key={star}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            onMouseEnter={() => setReviewHover(star)}
                            onMouseLeave={() => setReviewHover(0)}
                            style={{
                              fontSize: '32px', cursor: 'pointer', transition: 'transform 0.1s',
                              color: star <= (reviewHover || reviewForm.rating) ? '#f59e0b' : '#d1d5db',
                              transform: star <= (reviewHover || reviewForm.rating) ? 'scale(1.15)' : 'scale(1)',
                            }}>★</span>
                        ))}
                        {reviewForm.rating > 0 && (
                          <span style={{ alignSelf: 'center', fontSize: '13px', color: 'var(--text-muted)', marginLeft: '6px' }}>
                            {['', 'Bohat Bura', 'Bura', 'Theek Hai', 'Acha', 'Bohat Acha'][reviewForm.rating]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Comment */}
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: 'var(--text)' }}>
                        Aapka Review *
                      </label>
                      <textarea value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        placeholder="Is product ke baare mein apna experience share karein..."
                        rows={4}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>

                    <button type="submit" disabled={reviewSubmitting} className="btn-primary"
                      style={{ alignSelf: 'flex-start', padding: '10px 24px', opacity: reviewSubmitting ? 0.7 : 1 }}>
                      {reviewSubmitting ? 'Submit ho raha hai...' : 'Review Submit Karein'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px' }}>Related Products</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px' }}>
              {relatedProducts.map((p) => (
                <Link key={p._id} href={`/products/${p.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ backgroundColor: 'var(--bg)', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', overflow: 'hidden' }}>
                      {p.images && p.images[0] ? <img src={p.images[0]} alt={p.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                    </div>
                    <div style={{ padding: '12px' }}>
                      <h3 style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</h3>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>Rs. {p.price.toLocaleString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          [data-product-grid] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}