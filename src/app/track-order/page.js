'use client';
import { useState } from 'react';
import Link from 'next/link';

const steps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    setError('');
    setOrder(null);

    if (!orderId || !phone) {
      setError('Please enter both Order ID and Phone Number');
      return;
    }

    setLoading(true);
    try {
      const cleanOrderId = orderId.trim().replace(/^#/, '');
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(cleanOrderId)}&phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Order not found');
        return;
      }

      setOrder(data);
    } catch (err) {
      setError('Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  const currentStep = order ? steps.indexOf(order.orderStatus) : -1;
  const isCancelled = order?.orderStatus === 'Cancelled';

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '16px 16px' }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', fontWeight: '800', marginBottom: '4px' }}>Track Your Order</h1>
          <p style={{ opacity: 0.85, fontSize: '13px' }}>
            <Link href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</Link> → Track Order
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '24px 16px', maxWidth: '700px' }}>
        {/* Search Box */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
          <h2 style={{ fontWeight: '700', fontSize: '17px', color: 'var(--primary)', marginBottom: '8px' }}>Enter Order Details</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Enter your order number and phone number to track your order.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Order Number</label>
              <input type="text" placeholder="e.g. 6a35f25149614cc9ba125be8" value={orderId} onChange={(e) => setOrderId(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Phone Number</label>
              <input type="text" placeholder="03xxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'} />
            </div>
            {error && <p style={{ color: '#ef4444', fontSize: '14px' }}>❌ {error}</p>}
            <button onClick={handleTrack} disabled={loading} className="btn-primary" style={{ padding: '14px', fontSize: '15px', fontWeight: '700', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Searching...' : '🔍 Track Order'}
            </button>
          </div>
        </div>

        {/* Order Result */}
        {order && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Order ID</p>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary)', wordBreak: 'break-all' }}>#{order._id.slice(-8).toUpperCase()}</h3>
              </div>
              <span style={{
                backgroundColor: isCancelled ? '#f3f4f6' : '#fef9c3',
                color: isCancelled ? '#6b7280' : '#854d0e',
                padding: '6px 16px', borderRadius: '20px', fontWeight: '700', fontSize: '13px'
              }}>
                📦 {order.orderStatus}
              </span>
            </div>

            {/* Progress Bar */}
            {!isCancelled && (
              <div style={{ marginBottom: '32px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginBottom: '8px', minWidth: '320px' }}>
                  <div style={{ position: 'absolute', top: '14px', left: '10%', right: '10%', height: '3px', backgroundColor: 'var(--border)', zIndex: 0 }} />
                  <div style={{ position: 'absolute', top: '14px', left: '10%', width: `${(currentStep / (steps.length - 1)) * 80}%`, height: '3px', backgroundColor: 'var(--primary)', zIndex: 1, transition: 'width 0.5s' }} />

                  {steps.map((step, i) => (
                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2, flex: 1 }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: i <= currentStep ? 'var(--primary)' : 'var(--border)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '13px', marginBottom: '8px' }}>
                        {i < currentStep ? '✓' : i + 1}
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: i <= currentStep ? '700' : '400', color: i <= currentStep ? 'var(--primary)' : 'var(--text-muted)', textAlign: 'center' }}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isCancelled && (
              <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '14px', borderRadius: '10px', marginBottom: '24px', fontSize: '14px', textAlign: 'center' }}>
                This order has been cancelled. Contact us if you have any questions.
              </div>
            )}

            {/* Payment Status */}
            <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: '10px', backgroundColor: order.paymentStatus === 'Verified' ? '#f0fdf4' : order.paymentStatus === 'Rejected' ? '#fee2e2' : '#fef9c3' }}>
              <p style={{ fontSize: '13px', fontWeight: '700', color: order.paymentStatus === 'Verified' ? '#166534' : order.paymentStatus === 'Rejected' ? '#991b1b' : '#854d0e' }}>
                Payment Status: {order.paymentStatus}
              </p>
            </div>

            {/* Order Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '20px' }}>
              {[
                { label: 'Customer', value: order.customerName },
                { label: 'Phone', value: order.phone },
                { label: 'Payment Method', value: order.paymentMethod },
                { label: 'Order Date', value: new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
                { label: 'City', value: order.city },
                { label: 'Total', value: `Rs. ${order.total.toLocaleString()}` },
              ].map((info) => (
                <div key={info.label}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>{info.label}</p>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{info.value}</p>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Delivery Address</p>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>{order.address}</p>
            </div>

            {/* Order Items */}
            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '20px' }}>
              <h4 style={{ fontWeight: '700', fontSize: '15px', marginBottom: '14px', color: 'var(--primary)' }}>Order Items</h4>
              {order.orderItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text)' }}>{item.name} × {item.quantity}</span>
                  <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}