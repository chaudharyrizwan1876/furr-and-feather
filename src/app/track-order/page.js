'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiPackage, FiCheckCircle, FiTruck, FiClock, FiXCircle } from 'react-icons/fi';

const statusSteps = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

const statusColors = {
  Pending: { bg: '#fef3c7', text: '#92400e', icon: <FiClock /> },
  Confirmed: { bg: '#dbeafe', text: '#1e40af', icon: <FiCheckCircle /> },
  Shipped: { bg: '#e0e7ff', text: '#4338ca', icon: <FiTruck /> },
  Delivered: { bg: '#dcfce7', text: '#166534', icon: <FiCheckCircle /> },
  Cancelled: { bg: '#fee2e2', text: '#991b1b', icon: <FiXCircle /> },
};

function ProgressBar({ status }) {
  if (status === 'Cancelled') {
    return (
      <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '14px', borderRadius: '10px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>
        ❌ Yeh order cancel ho gaya hai
      </div>
    );
  }

  const currentIndex = statusSteps.indexOf(status);

  return (
    <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '10px 0' }}>
      {statusSteps.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < statusSteps.length - 1 ? 1 : 'none', minWidth: '90px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: i <= currentIndex ? 'var(--primary)' : 'var(--border)',
              color: i <= currentIndex ? 'white' : 'var(--text-muted)', fontSize: '14px', flexShrink: 0,
            }}>
              {i <= currentIndex ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '11px', fontWeight: '600', color: i <= currentIndex ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step}</span>
          </div>
          {i < statusSteps.length - 1 && (
            <div style={{ flex: 1, height: '2px', backgroundColor: i < currentIndex ? 'var(--primary)' : 'var(--border)', margin: '0 6px', marginBottom: '20px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Order ID</p>
          <p style={{ fontWeight: '700', fontSize: '14px', wordBreak: 'break-all' }}>{order._id}</p>
        </div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
          backgroundColor: statusColors[order.orderStatus]?.bg, color: statusColors[order.orderStatus]?.text,
        }}>
          {statusColors[order.orderStatus]?.icon} {order.orderStatus}
        </span>
      </div>

      <ProgressBar status={order.orderStatus} />

      <div style={{ borderTop: '1px solid var(--border)', marginTop: '16px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', fontSize: '13px' }}>
        <span style={{ color: 'var(--text-muted)' }}>{order.orderItems?.length || 0} item(s) • {order.city}</span>
        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Rs. {order.total?.toLocaleString()}</span>
      </div>
      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
        {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </div>
  );
}

export default function TrackOrderPage() {
  const [mode, setMode] = useState('orderId'); // 'orderId' | 'phone'

  // Order ID + Phone mode
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [singleOrder, setSingleOrder] = useState(null);

  // Phone-only mode (saare orders)
  const [phoneOnly, setPhoneOnly] = useState('');
  const [phoneOrders, setPhoneOrders] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrackByOrderId = async (e) => {
    e.preventDefault();
    setError('');
    setSingleOrder(null);
    if (!orderId.trim() || !phone.trim()) {
      setError('Order ID aur phone number dono zaroori hain');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?orderId=${orderId.trim()}&phone=${phone.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Order nahi mila');
        return;
      }
      setSingleOrder(data);
    } catch (err) {
      setError('Kuch ghalat ho gaya, dobara koshish karein');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackByPhone = async (e) => {
    e.preventDefault();
    setError('');
    setPhoneOrders(null);
    if (!phoneOnly.trim()) {
      setError('Phone number zaroori hai');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/track-by-phone?phone=${phoneOnly.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Koi order nahi mila');
        return;
      }
      setPhoneOrders(data);
    } catch (err) {
      setError('Kuch ghalat ho gaya, dobara koshish karein');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '40px 16px' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>📦</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text)', marginBottom: '6px' }}>Track Your Order</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Apne order ki current status check karein</p>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { setMode('orderId'); setError(''); }}
            style={{ padding: '10px 20px', borderRadius: '20px', border: '2px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer', borderColor: mode === 'orderId' ? 'var(--primary)' : 'var(--border)', backgroundColor: mode === 'orderId' ? 'var(--primary)' : 'white', color: mode === 'orderId' ? 'white' : 'var(--text)' }}>
            🔎 Order ID se Track Karein
          </button>
          <button onClick={() => { setMode('phone'); setError(''); }}
            style={{ padding: '10px 20px', borderRadius: '20px', border: '2px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer', borderColor: mode === 'phone' ? 'var(--primary)' : 'var(--border)', backgroundColor: mode === 'phone' ? 'var(--primary)' : 'white', color: mode === 'phone' ? 'white' : 'var(--text)' }}>
            📱 Sirf Phone Number se (Meray Saare Orders)
          </button>
        </div>

        {/* ===== MODE: Order ID + Phone ===== */}
        {mode === 'orderId' && (
          <>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
              <form onSubmit={handleTrackByOrderId} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Order ID</label>
                  <input type="text" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID paste karein"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Phone Number</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xxxxxxxxx"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
                </div>
                {error && <p style={{ color: '#991b1b', fontSize: '13px' }}>{error}</p>}
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px', opacity: loading ? 0.7 : 1 }}>
                  <FiSearch style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
                  {loading ? 'Searching...' : 'Track Order'}
                </button>
              </form>
            </div>

            {singleOrder && <OrderCard order={singleOrder} />}
          </>
        )}

        {/* ===== MODE: Phone Only (saare orders) ===== */}
        {mode === 'phone' && (
          <>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Order ID yaad nahi? Koi baat nahi — apna phone number daalein aur us number se kiye gaye SAARE orders ki list mil jayegi.
              </p>
              <form onSubmit={handleTrackByPhone} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input type="text" value={phoneOnly} onChange={(e) => setPhoneOnly(e.target.value)} placeholder="03xxxxxxxxx"
                  style={{ flex: 1, minWidth: '200px', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
                <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '11px 24px', opacity: loading ? 0.7 : 1, whiteSpace: 'nowrap' }}>
                  {loading ? 'Searching...' : 'Find My Orders'}
                </button>
              </form>
              {error && <p style={{ color: '#991b1b', fontSize: '13px', marginTop: '10px' }}>{error}</p>}
            </div>

            {phoneOrders && (
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>{phoneOrders.length} order(s) mile</p>
                {phoneOrders.map((order) => <OrderCard key={order._id} order={order} />)}
              </div>
            )}
          </>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          Account hai? <Link href="/account/orders" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login kar ke apni poori order history dekhein →</Link>
        </p>
      </div>
    </div>
  );
}
