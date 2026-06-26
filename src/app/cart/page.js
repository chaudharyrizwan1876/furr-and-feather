'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import useCartStore from '@/store/useCartStore';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const getSubtotal = useCartStore((state) => state.getSubtotal);

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading cart...</p>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shipping = subtotal === 0 ? 0 : 300;
  const total = subtotal + shipping - discount;

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME10') {
      setDiscount(Math.round(subtotal * 0.1));
      setCouponMsg('✅ 10% discount applied!');
    } else if (couponCode.toUpperCase() === 'FREESHIP') {
      setDiscount(150);
      setCouponMsg('✅ Free shipping applied!');
    } else {
      setDiscount(0);
      setCouponMsg('❌ Invalid coupon code');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '32px 16px' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', marginBottom: '8px' }}>Your Cart</h1>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link> → Cart
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '20px 16px' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '16px' }}>
            <div style={{ fontSize: '70px', marginBottom: '20px' }}>🛒</div>
            <h2 style={{ color: 'var(--text)', marginBottom: '10px' }}>Your cart is empty</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add some products to continue shopping</p>
            <Link href="/shop" className="btn-primary">Continue Shopping</Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}
            data-cart-grid>
            {/* Cart Items */}
            <div>
              <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <h2 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '18px', color: 'var(--primary)' }}>
                  Cart Items ({items.length})
                </h2>

                {items.map((item, index) => (
                  <div key={item.productId}>
                    <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: '12px', alignItems: 'center', padding: '14px 0' }}
                      data-cart-item>
                      {/* Image */}
                      <div style={{ backgroundColor: 'var(--bg)', borderRadius: '10px', height: '70px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                        {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                      </div>

                      {/* Info */}
                      <div>
                        <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px', lineHeight: '1.4' }}>{item.name}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '2px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              style={{ padding: '4px 10px', border: 'none', backgroundColor: 'var(--bg)', cursor: 'pointer', fontWeight: '700' }}>-</button>
                            <span style={{ padding: '4px 10px', fontWeight: '700' }}>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              style={{ padding: '4px 10px', border: 'none', backgroundColor: 'var(--bg)', cursor: 'pointer', fontWeight: '700' }}>+</button>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rs. {item.price.toLocaleString()} each</span>
                        </div>
                      </div>

                      {/* Price & Remove */}
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--primary)', marginBottom: '6px' }}>
                          Rs. {(item.price * item.quantity).toLocaleString()}
                        </p>
                        <button onClick={() => removeItem(item.productId)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: '600' }}>
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                    {index < items.length - 1 && <div style={{ borderTop: '1px solid var(--border)' }} />}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '16px' }}>
                <Link href="/shop" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <h2 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '18px', color: 'var(--primary)' }}>Order Summary</h2>

              <div style={{ marginBottom: '18px' }}>
                {[
                  { label: 'Subtotal', value: `Rs. ${subtotal.toLocaleString()}` },
                  { label: 'Shipping', value: shipping === 0 ? 'FREE' : `Rs. ${shipping}` },
                  ...(discount > 0 ? [{ label: 'Discount', value: `-Rs. ${discount}` }] : []),
                ].map((row) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                    <span style={{ fontWeight: '600', color: row.label === 'Discount' ? '#16a34a' : 'var(--text)' }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ borderTop: '2px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '800' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--primary)' }}>Rs. {total.toLocaleString()}</span>
                </div>
              </div>

              

              <div style={{ marginBottom: '18px' }}>
                <p style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Coupon Code</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Enter code" value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    style={{ flex: 1, minWidth: 0, padding: '9px 10px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '13px' }} />
                  <button onClick={applyCoupon}
                    style={{ padding: '9px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    Apply
                  </button>
                </div>
                {couponMsg && <p style={{ fontSize: '12px', marginTop: '6px', color: couponMsg.startsWith('✅') ? '#16a34a' : '#ef4444' }}>{couponMsg}</p>}
              </div>

              <Link href="/checkout" className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '14px', fontSize: '15px', fontWeight: '700' }}>
                Proceed to Checkout →
              </Link>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          [data-cart-grid] {
            grid-template-columns: 1fr !important;
          }
          [data-cart-item] {
            grid-template-columns: 56px 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}