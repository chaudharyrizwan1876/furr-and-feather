'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiEye } from 'react-icons/fi';

const statusColors = {
  Pending: { bg: '#fef9c3', text: '#854d0e' },
  Confirmed: { bg: '#dbeafe', text: '#1e40af' },
  Shipped: { bg: '#e0e7ff', text: '#4338ca' },
  Delivered: { bg: '#dcfce7', text: '#166534' },
  Cancelled: { bg: '#f3f4f6', text: '#6b7280' },
};

const paymentStatusColors = {
  Pending: { bg: '#fee2e2', text: '#991b1b' },
  Verified: { bg: '#dcfce7', text: '#166534' },
  Rejected: { bg: '#f3f4f6', text: '#6b7280' },
};

const tabs = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Orders fetch nahi hue', err);
    } finally {
      setLoading(false);
    }
  };

  const openOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setNewPaymentStatus(order.paymentStatus);
  };

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus, paymentStatus: newPaymentStatus }),
      });
      const updated = await res.json();

      if (res.ok) {
        setOrders(orders.map((o) => (o._id === updated._id ? updated : o)));
        setSelectedOrder(null);
      }
    } catch (err) {
      alert('Status update nahi hua');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === 'All' || o.orderStatus === activeTab;
    const matchSearch =
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o._id.toLowerCase().includes(search.toLowerCase()) ||
      o.phone.includes(search);
    return matchTab && matchSearch;
  });

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text)', marginBottom: '6px' }}>Orders</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>Manage and track customer orders</p>

      <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: activeTab === tab ? 'var(--primary)' : 'var(--bg)', color: activeTab === tab ? 'white' : 'var(--text)', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
              {tab} {tab !== 'All' && `(${orders.filter((o) => o.orderStatus === tab).length})`}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', padding: '10px 14px' }}>
          <FiSearch style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search by order ID, customer or phone..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', flex: 1, fontSize: '14px' }} />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading orders...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No orders found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Order ID', 'Customer', 'Total', 'Payment', 'Status', 'Date', 'Action'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 12px', fontWeight: '600', color: 'var(--primary)', fontSize: '12px' }}>#{order._id.slice(-8)}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <div>{order.customerName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{order.phone}</div>
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: '600' }}>Rs. {order.total.toLocaleString()}</td>
                    <td style={{ padding: '14px 12px' }}>{order.paymentMethod}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ backgroundColor: statusColors[order.orderStatus]?.bg, color: statusColors[order.orderStatus]?.text, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <button onClick={() => openOrder(order)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '18px' }}>
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div onClick={() => setSelectedOrder(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', maxWidth: '560px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontWeight: '800', fontSize: '18px', color: 'var(--primary)', marginBottom: '20px' }}>
              Order #{selectedOrder._id.slice(-8)}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer</p>
                <p style={{ fontWeight: '600', fontSize: '14px' }}>{selectedOrder.customerName}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Phone</p>
                <p style={{ fontWeight: '600', fontSize: '14px' }}>{selectedOrder.phone}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>City</p>
                <p style={{ fontWeight: '600', fontSize: '14px' }}>{selectedOrder.city}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Payment Method</p>
                <p style={{ fontWeight: '600', fontSize: '14px' }}>{selectedOrder.paymentMethod}</p>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Address</p>
              <p style={{ fontWeight: '600', fontSize: '14px' }}>{selectedOrder.address}</p>
            </div>

            {selectedOrder.notes && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Notes</p>
                <p style={{ fontWeight: '500', fontSize: '13px' }}>{selectedOrder.notes}</p>
              </div>
            )}

            {/* Order Items */}
            <div style={{ marginBottom: '16px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Order Items</p>
              {selectedOrder.orderItems.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ fontWeight: '600' }}>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                <span>Total</span>
                <span style={{ color: 'var(--primary)' }}>Rs. {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Receipt */}
            {selectedOrder.paymentScreenshot && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>Payment Receipt</p>
                <a href={selectedOrder.paymentScreenshot} target="_blank" rel="noopener noreferrer">
                  <img src={selectedOrder.paymentScreenshot} alt="Receipt" style={{ width: '120px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                </a>
              </div>
            )}

            {/* Status Updates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Order Status</p>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }}>
                  {['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Payment Status</p>
                <select value={newPaymentStatus} onChange={(e) => setNewPaymentStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }}>
                  {['Pending', 'Verified', 'Rejected'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setSelectedOrder(null)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid var(--border)', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600' }}>
                Close
              </button>
              <button onClick={handleUpdateStatus} disabled={updating} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', cursor: 'pointer', fontWeight: '600', opacity: updating ? 0.7 : 1 }}>
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}