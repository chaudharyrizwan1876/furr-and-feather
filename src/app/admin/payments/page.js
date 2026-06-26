'use client';
import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const paymentStatusColors = {
  Pending: { bg: '#fef3c7', text: '#92400e' },
  Verified: { bg: '#dcfce7', text: '#166534' },
  Rejected: { bg: '#fee2e2', text: '#991b1b' },
};

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Pending');
  const [previewImg, setPreviewImg] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Orders fetch nahi hui', err);
      toast.error('Payments load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, paymentStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });
      if (!res.ok) throw new Error('fail');
      setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, paymentStatus } : o)));
      toast.success(paymentStatus === 'Verified' ? 'Payment verify ho gaya' : 'Payment reject ho gaya');
    } catch (err) {
      toast.error('Kuch ghalat ho gaya');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = orders.filter((o) => filter === 'all' || o.paymentStatus === filter);

  if (loading) {
    return <LoadingSpinner text="Loading payments..." />;
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>Payments</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>Verify customer payment receipts before confirming orders</p>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'Pending', label: `Pending (${orders.filter((o) => o.paymentStatus === 'Pending').length})` },
          { key: 'Verified', label: `Verified (${orders.filter((o) => o.paymentStatus === 'Verified').length})` },
          { key: 'Rejected', label: `Rejected (${orders.filter((o) => o.paymentStatus === 'Rejected').length})` },
          { key: 'all', label: `All (${orders.length})` },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '2px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              borderColor: filter === tab.key ? 'var(--primary)' : 'var(--border)',
              backgroundColor: filter === tab.key ? 'var(--primary)' : 'white',
              color: filter === tab.key ? 'white' : 'var(--text)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          No payments {filter !== 'all' ? `in "${filter}"` : ''} right now.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((order) => (
            <div key={order._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                {/* Receipt thumbnail */}
                <div style={{ flexShrink: 0, cursor: order.paymentScreenshot ? 'pointer' : 'default' }}
                  onClick={() => order.paymentScreenshot && setPreviewImg(order.paymentScreenshot)}>
                  {order.paymentScreenshot ? (
                    <div style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '10px', overflow: 'hidden', border: '2px solid var(--border)' }}>
                      <img src={order.paymentScreenshot} alt="Receipt" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                        <FiEye size={16} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: '70px', height: '70px', borderRadius: '10px', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '4px' }}>
                      No Receipt
                    </div>
                  )}
                </div>

                {/* Order info */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{order.customerName}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px',
                      backgroundColor: paymentStatusColors[order.paymentStatus]?.bg, color: paymentStatusColors[order.paymentStatus]?.text,
                    }}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    {order.phone} • {order.paymentMethod} • Rs. {order.total?.toLocaleString()}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => handleUpdateStatus(order._id, 'Verified')}
                    disabled={updatingId === order._id || order.paymentStatus === 'Verified'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                      backgroundColor: order.paymentStatus === 'Verified' ? '#f3f4f6' : '#dcfce7',
                      color: order.paymentStatus === 'Verified' ? '#9ca3af' : '#166534',
                      opacity: updatingId === order._id ? 0.6 : 1,
                    }}>
                    <FiCheck size={14} /> Approve
                  </button>
                  <button onClick={() => handleUpdateStatus(order._id, 'Rejected')}
                    disabled={updatingId === order._id || order.paymentStatus === 'Rejected'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                      backgroundColor: order.paymentStatus === 'Rejected' ? '#f3f4f6' : '#fee2e2',
                      color: order.paymentStatus === 'Rejected' ? '#9ca3af' : '#991b1b',
                      opacity: updatingId === order._id ? 0.6 : 1,
                    }}>
                    <FiX size={14} /> Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Receipt Preview Modal */}
      {previewImg && (
        <div onClick={() => setPreviewImg(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px', cursor: 'zoom-out' }}>
          <img src={previewImg} alt="Payment Receipt" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px' }} onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setPreviewImg(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiX size={20} />
          </button>
        </div>
      )}
    </div>
  );
}
