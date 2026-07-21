'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiTruck, FiClock, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';

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
      <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px', borderRadius: '8px', textAlign: 'center', fontWeight: '600', fontSize: '13px' }}>
        ❌ This order has been cancelled
      </div>
    );
  }
  const currentIndex = statusSteps.indexOf(status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', overflowX: 'auto', padding: '6px 0' }}>
      {statusSteps.map((step, i) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', flex: i < statusSteps.length - 1 ? 1 : 'none', minWidth: '80px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: i <= currentIndex ? 'var(--primary)' : 'var(--border)',
              color: i <= currentIndex ? 'white' : 'var(--text-muted)', fontSize: '12px', flexShrink: 0,
            }}>
              {i <= currentIndex ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '10px', fontWeight: '600', color: i <= currentIndex ? 'var(--primary)' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>{step}</span>
          </div>
          {i < statusSteps.length - 1 && (
            <div style={{ flex: 1, height: '2px', backgroundColor: i < currentIndex ? 'var(--primary)' : 'var(--border)', margin: '0 4px', marginBottom: '16px' }} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await fetch('/api/orders/my');
      if (res.status === 401) {
        setNotLoggedIn(true);
        return;
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your orders..." />;
  }

  if (notLoggedIn) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>Login Required</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Please log in first to view your order history.</p>
          <Link href="/account?redirect=/account/orders" className="btn-primary" style={{ display: 'inline-block', padding: '10px 24px' }}>Log In</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', padding: '30px 16px' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <button onClick={() => router.push('/account')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginBottom: '16px' }}>
          <FiArrowLeft size={15} /> Back to Account
        </button>

        <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>My Orders</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>Your complete order history — always available here</p>

        {orders.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '50px 20px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No orders yet</p>
            <Link href="/shop" className="btn-primary" style={{ display: 'inline-block', padding: '10px 24px' }}>Start Shopping</Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order._id} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Order ID</p>
                  <p style={{ fontWeight: '700', fontSize: '13px', wordBreak: 'break-all' }}>{order._id}</p>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  backgroundColor: statusColors[order.orderStatus]?.bg, color: statusColors[order.orderStatus]?.text,
                }}>
                  {statusColors[order.orderStatus]?.icon} {order.orderStatus}
                </span>
              </div>

              <ProgressBar status={order.orderStatus} />

              <div style={{ borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '12px' }}>
                <span style={{ color: 'var(--text-muted)' }}>{order.orderItems?.length || 0} item(s) • {order.city}</span>
                <span style={{ fontWeight: '700', color: 'var(--primary)' }}>Rs. {order.total?.toLocaleString()}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
