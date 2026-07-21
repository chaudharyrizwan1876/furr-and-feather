'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUploadCloud, FiCheckCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import useCartStore from '@/store/useCartStore';

// =====================================================================
// ADMIN'S WHATSAPP NUMBER — ENTER YOUR REAL NUMBER HERE
// Format: country code + number (no spaces, dashes, or +)
// Example: Pakistan 03001234567 → 923001234567
// =====================================================================
const ADMIN_WHATSAPP = '923295780676'; // ← ENTER YOUR NUMBER HERE

// =====================================================================
// PAYMENT DETAILS — ENTER YOUR REAL VALUES HERE
// Update this one place only, everything else updates automatically
// =====================================================================
const paymentAccounts = {
  Easypaisa: {
    number: '03427524477',        // ← ENTER YOUR EASYPAISA NUMBER HERE
    title: 'Muhammad Rizwan',  // ← Account title (name) — change if different
  },
  JazzCash: {
    number: '03295780676',        // ← ENTER YOUR JAZZCASH NUMBER HERE
    title: 'Muhammad Rizwan',  // ← Account title (name) — change if different
  },
  BankTransfer: {
    bank: 'JS Bank',          // ← ENTER YOUR BANK NAME HERE (e.g. "Meezan Bank", "HBL", "UBL")
    accountNumber: '0002842674',  // ← ENTER YOUR ACCOUNT NUMBER HERE
    iban: 'PK11JSBL9141000002842764', // ← ENTER YOUR IBAN HERE
    title: 'Muhammad Rizwan',  // ← Account title (name) — change if different
  },
};

const SHIPPING_COST = 300;
const COD_CITIES = ['Rawalpindi', 'Islamabad'];

const cities = [
  'Rawalpindi', 'Islamabad', 'Lahore', 'Karachi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta',
  'Sialkot', 'Gujranwala', 'Hyderabad', 'Sukkur', 'Bahawalpur', 'Sargodha', 'Sheikhupura',
  'Larkana', 'Rahim Yar Khan', 'Gujrat', 'Mardan', 'Kasur', 'Dera Ghazi Khan', 'Sahiwal',
  'Nawabshah', 'Mingora', 'Okara', 'Mirpur Khas', 'Chiniot', 'Kamoke', 'Mandi Bahauddin',
  'Jhelum', 'Sadiqabad', 'Jacobabad', 'Khanewal', 'Hafizabad', 'Kohat', 'Muzaffargarh',
  'Khanpur', 'Gojra', 'Mianwali', 'Abbottabad', 'Muridke', 'Pakpattan', 'Vehari', 'Dera Ismail Khan',
  'Tando Adam', 'Jaranwala', 'Khairpur', 'Chishtian', 'Daska', 'Bahawalnagar', 'Jhang',
  'Attock', 'Other',
];

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const getSubtotal = useCartStore((state) => state.getSubtotal);
  const clearCart = useCartStore((state) => state.clearCart);

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', city: '', customCity: '', notes: '' });
  const [paymentMethod, setPaymentMethod] = useState('Easypaisa');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const subtotal = getSubtotal();
  const total = subtotal + SHIPPING_COST;
  const isCOD = paymentMethod === 'COD';
  const isCODAvailable = COD_CITIES.includes(form.city);
  const finalCity = form.city === 'Other' ? form.customCity : form.city;

  const handleChange = (e) => {
    const newForm = { ...form, [e.target.name]: e.target.value };
    setForm(newForm);

    if (e.target.name === 'city' && paymentMethod === 'COD' && !COD_CITIES.includes(e.target.value)) {
      setPaymentMethod('Easypaisa');
      setScreenshot(null);
      setScreenshotPreview(null);
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshot(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    setError('');

    if (!form.name || !form.phone || !form.address || !form.city) {
      setError('Name, phone, address and city are required');
      return;
    }

    if (form.city === 'Other' && !form.customCity) {
      setError('Please enter your city name');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!screenshot) {
      setError('Please upload the payment receipt to continue');
      return;
    }

    setLoading(true);

    // Check whether the user is logged in, and if so, get their ID
    // so the order can be linked to their account (shown in My Orders)
    let loggedInUserId = null;
    try {
      const sessionRes = await fetch('/api/auth/me');
      const sessionData = await sessionRes.json();
      if (sessionData.user) {
        loggedInUserId = sessionData.user.userId || null;
      }
    } catch (err) {
      // If the session check fails, proceed as a guest — no issue
    }

    try {
      const formData = new FormData();
      formData.append('image', screenshot);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        throw new Error(uploadData.message || 'Receipt upload failed');
      }

      const orderItems = items.map((item) => ({
        product: item.productId,
        variantId: item.variantId || undefined,
        variantLabel: item.variantLabel || undefined,
        name: item.variantLabel ? `${item.name} (${item.variantLabel})` : item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
      }));

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: loggedInUserId,
          customerName: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: finalCity,
          orderItems,
          subtotal,
          shippingCost: SHIPPING_COST,
          total,
          paymentMethod,
          paymentScreenshot: uploadData.url,
          notes: form.notes,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        throw new Error(orderData.message || 'Order could not be placed');
      }

      setOrderPlaced(orderData);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    // Pre-filled WhatsApp message — order details are already typed in when the message reaches the admin
    const waMessage = encodeURIComponent(
      `Hello! I have just placed an order.\n\n` +
      `Order ID: ${orderPlaced._id}\n` +
      `Name: ${orderPlaced.customerName}\n` +
      `Phone: ${orderPlaced.phone}\n\n` +
      `Thank you!`
    );
    const waLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${waMessage}`;

    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px 28px', textAlign: 'center', maxWidth: '480px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
          <div style={{ width: '70px', height: '70px', backgroundColor: '#f0fdf4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '32px' }}>✅</div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '12px' }}>Thank You!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '8px', fontSize: '14px' }}>Your order has been placed successfully.</p>

          <div style={{ backgroundColor: 'var(--bg)', borderRadius: '10px', padding: '14px', margin: '18px 0' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Order Number</p>
            <p style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', wordBreak: 'break-all' }}>{orderPlaced._id}</p>
          </div>

          {/* WhatsApp Confirmation Button */}
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <p style={{ fontSize: '13px', color: '#166534', fontWeight: '600', marginBottom: '4px' }}>📱 Confirm Your Order</p>
            <p style={{ fontSize: '12px', color: '#166534', marginBottom: '12px', opacity: 0.8 }}>For the best experience, confirm your order on WhatsApp — the message will already be ready, just tap send</p>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#25D366', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '15px' }}>
              <FaWhatsapp size={20} /> Confirm on WhatsApp
            </a>
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>We will contact you shortly to confirm your order.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/track-order" className="btn-primary">Track Order</Link>
            <Link href="/shop" className="btn-outline">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '60px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ color: 'var(--text)', marginBottom: '16px' }}>Your cart is empty</h2>
        <Link href="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '32px 16px' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: '800', marginBottom: '8px' }}>Checkout</h1>
          <p style={{ opacity: 0.85, fontSize: '14px' }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link>
            {' → '}
            <Link href="/cart" style={{ color: 'white', textDecoration: 'none' }}>Cart</Link>
            {' → '} Checkout
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '20px 16px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '20px', alignItems: 'start' }}
        data-checkout-grid>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              ❌ {error}
            </div>
          )}

          <h2 style={{ fontWeight: '700', fontSize: '17px', marginBottom: '18px', color: 'var(--primary)' }}>Billing Details</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}
            data-form-row>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Full Name *</label>
              <input type="text" name="name" placeholder="Enter your full name" value={form.name} onChange={handleChange}
                style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Phone Number *</label>
              <input type="tel" name="phone" placeholder="03xxxxxxxxx" value={form.phone} onChange={handleChange}
                style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Email Address</label>
            <input type="email" name="email" placeholder="Enter your email (optional)" value={form.email} onChange={handleChange}
              style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Address *</label>
            <input type="text" name="address" placeholder="House no, Street, Area" value={form.address} onChange={handleChange}
              style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: form.city === 'Other' ? '1fr 1fr' : '1fr', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>City *</label>
              <select name="city" value={form.city} onChange={handleChange}
                style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }}>
                <option value="">Select City</option>
                {cities.map(city => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            {form.city === 'Other' && (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Enter City Name *</label>
                <input type="text" name="customCity" placeholder="Type your city" value={form.customCity} onChange={handleChange}
                  style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Order Notes (Optional)</label>
            <textarea name="notes" placeholder="Any special instructions..." value={form.notes} onChange={handleChange} rows={3}
              style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px', resize: 'vertical' }} />
          </div>

          <h2 style={{ fontWeight: '700', fontSize: '17px', marginBottom: '14px', color: 'var(--primary)' }}>Payment Method</h2>

          {!isCODAvailable && form.city && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '13px' }}>
              📍 Cash on Delivery is only available in Rawalpindi and Islamabad. Online payment is required for your selected city.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {[
              { value: 'COD', label: '💵 Cash on Delivery' },
              { value: 'Easypaisa', label: '📱 Easypaisa' },
              { value: 'JazzCash', label: '📱 JazzCash' },
              { value: 'BankTransfer', label: '🏦 Bank Transfer' },
            ].filter((pm) => pm.value !== 'COD' || isCODAvailable).map((pm) => (
              <div key={pm.value} onClick={() => { setPaymentMethod(pm.value); setScreenshot(null); setScreenshotPreview(null); }}
                style={{ padding: '14px', borderRadius: '10px', border: `2px solid ${paymentMethod === pm.value ? 'var(--primary)' : 'var(--border)'}`, cursor: 'pointer', backgroundColor: paymentMethod === pm.value ? '#f0f1ff' : 'white', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${paymentMethod === pm.value ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: paymentMethod === pm.value ? 'var(--primary)' : 'white', flexShrink: 0 }} />
                  <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>{pm.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '22px', padding: '16px', backgroundColor: '#fef9c3', borderRadius: '10px', border: '2px solid #fbbf24' }}>
            {isCOD ? (
              <>
                <p style={{ fontWeight: '700', fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                  📦 Cash on Delivery — Advance Delivery Charges Required
                </p>
                <p style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6', marginBottom: '10px' }}>
                  To confirm your order, please pay Rs. {SHIPPING_COST} delivery charges in advance. The remaining amount (Rs. {subtotal.toLocaleString()}) will be paid in cash on delivery.
                </p>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p><strong>Easypaisa:</strong> {paymentAccounts.Easypaisa.number} ({paymentAccounts.Easypaisa.title})</p>
                  <p><strong>JazzCash:</strong> {paymentAccounts.JazzCash.number} ({paymentAccounts.JazzCash.title})</p>
                  <p><strong>Bank:</strong> {paymentAccounts.BankTransfer.bank}</p>
                  <p><strong>Account Number:</strong> {paymentAccounts.BankTransfer.accountNumber}</p>
                  <p><strong>IBAN:</strong> {paymentAccounts.BankTransfer.iban}</p>
                  <p style={{ marginTop: '4px', fontWeight: '700', color: 'var(--primary)' }}>Amount to send: Rs. {SHIPPING_COST}</p>
                </div>
              </>
            ) : paymentMethod === 'BankTransfer' ? (
              <>
                <p style={{ fontWeight: '700', fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>🏦 Bank Transfer — Advance Payment Required</p>
                <p style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6', marginBottom: '10px' }}>
                  {isCOD
                    ? `To confirm your order, please transfer the delivery charges of Rs. ${SHIPPING_COST} in advance. The product amount (Rs. ${subtotal.toLocaleString()}) will be collected at the time of delivery.`
                    : `To confirm your order, please transfer the full amount of Rs. ${total.toLocaleString()} in advance (includes delivery charges).`
                  }
                </p>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <p><strong>Bank:</strong> {paymentAccounts.BankTransfer.bank}</p>
                  <p><strong>Account Number:</strong> {paymentAccounts.BankTransfer.accountNumber}</p>
                  <p><strong>IBAN:</strong> {paymentAccounts.BankTransfer.iban}</p>
                  <p><strong>Account Title:</strong> {paymentAccounts.BankTransfer.title}</p>
                  <p style={{ marginTop: '4px', fontWeight: '700', color: 'var(--primary)' }}>
                    Amount to transfer: Rs. {isCOD ? SHIPPING_COST : total.toLocaleString()}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontWeight: '700', fontSize: '14px', color: '#92400e', marginBottom: '8px' }}>
                  📱 {paymentMethod} — Advance Payment Required
                </p>
                <p style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6', marginBottom: '10px' }}>
                  {isCOD
                    ? `To confirm your order, please send the delivery charges of Rs. ${SHIPPING_COST} in advance. The product amount (Rs. ${subtotal.toLocaleString()}) will be collected at the time of delivery.`
                    : `To confirm your order, please send the full amount of Rs. ${total.toLocaleString()} in advance (includes delivery charges).`
                  }
                </p>
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '12px', fontSize: '13px', color: 'var(--text)' }}>
                  <p><strong>Number:</strong> {paymentAccounts[paymentMethod].number}</p>
                  <p><strong>Account Title:</strong> {paymentAccounts[paymentMethod].title}</p>
                  <p style={{ marginTop: '6px', fontWeight: '700', color: 'var(--primary)' }}>
                    Amount to send: Rs. {isCOD ? SHIPPING_COST : total.toLocaleString()}
                  </p>
                </div>
              </>
            )}
            <p style={{ fontSize: '12px', color: '#92400e', marginTop: '10px' }}>
              After making the payment, please upload your receipt/screenshot below.
            </p>
          </div>

          {/* Professional Receipt Upload */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: 'var(--text)' }}>
              Upload Payment Receipt *
            </label>
            <label htmlFor="receipt-upload" style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
              border: `2px dashed ${screenshotPreview ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: '12px', padding: screenshotPreview ? '16px' : '32px 16px',
              backgroundColor: screenshotPreview ? '#f0f1ff' : 'var(--bg)',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
            }}
              onMouseEnter={e => { if (!screenshotPreview) e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { if (!screenshotPreview) e.currentTarget.style.borderColor = 'var(--border)'; }}>
              {screenshotPreview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', width: '100%' }}>
                  <img src={screenshotPreview} alt="Receipt" style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                  <div style={{ textAlign: 'left', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: '700', fontSize: '13px', marginBottom: '2px' }}>
                      <FiCheckCircle /> Receipt uploaded
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click to change image</p>
                  </div>
                </div>
              ) : (
                <>
                  <FiUploadCloud size={32} style={{ color: 'var(--primary)' }} />
                  <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>Click to upload your payment screenshot</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PNG, JPG up to 5MB</p>
                </>
              )}
            </label>
            <input id="receipt-upload" type="file" accept="image/*" onChange={handleScreenshotChange} style={{ display: 'none' }} />
          </div>

          <button onClick={handleSubmit} disabled={loading} className="btn-primary" style={{ width: '100%', padding: '15px', fontSize: '15px', fontWeight: '800', textAlign: 'center', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Placing Order...' : isCODAvailable
              ? `✅ Place Order — Pay Rs. ${SHIPPING_COST} Now`
              : `✅ Place Order — Pay Rs. ${total.toLocaleString()} Now`
            }
          </button>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', position: 'sticky', top: '20px' }}>
          <h2 style={{ fontWeight: '700', fontSize: '17px', marginBottom: '18px', color: 'var(--primary)' }}>Your Order</h2>

          {items.map((item) => (
            <div key={`${item.productId}-${item.variantId || 'base'}`} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ backgroundColor: 'var(--bg)', borderRadius: '8px', width: '44px', height: '44px', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.image ? <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text)', lineHeight: '1.4', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                {item.variantLabel && (
                  <p style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600', marginBottom: '2px' }}>{item.variantLabel}</p>
                )}
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Qty: {item.quantity}</p>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)', whiteSpace: 'nowrap' }}>Rs. {(item.price * item.quantity).toLocaleString()}</p>
            </div>
          ))}

          {[
            { label: 'Subtotal', value: `Rs. ${subtotal.toLocaleString()}` },
            { label: 'Shipping', value: `Rs. ${SHIPPING_COST}` },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
              <span style={{ fontWeight: '600' }}>{row.value}</span>
            </div>
          ))}

          <div style={{ borderTop: '2px solid var(--border)', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '800', marginTop: '4px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>Rs. {total.toLocaleString()}</span>
          </div>

          {form.city && (
            <div style={{ marginTop: '12px', padding: '12px', backgroundColor: isCODAvailable ? '#f0fdf4' : '#eff6ff', borderRadius: '8px', fontSize: '13px', color: isCODAvailable ? '#166534' : '#1e40af', lineHeight: '1.8' }}>
              {isCODAvailable ? (
                <>
                  💳 Pay now: <strong>Rs. {SHIPPING_COST}</strong> (delivery charges)<br />
                  🚚 Pay on delivery: <strong>Rs. {subtotal.toLocaleString()}</strong>
                </>
              ) : (
                <>
                  💳 Pay Now: <strong>Rs. {total.toLocaleString()}</strong> (full payment in advance)
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          [data-checkout-grid] {
            grid-template-columns: 1fr !important;
          }
          [data-form-row] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}