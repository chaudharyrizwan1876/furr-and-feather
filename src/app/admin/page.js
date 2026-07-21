'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiBox, FiShoppingBag, FiUsers, FiDollarSign, FiClock, FiAlertTriangle, FiStar, FiArrowRight } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';

const statusColors = {
  Pending: { bg: '#fef3c7', text: '#92400e' },
  Confirmed: { bg: '#dbeafe', text: '#1e40af' },
  Shipped: { bg: '#e0e7ff', text: '#4338ca' },
  Delivered: { bg: '#dcfce7', text: '#166534' },
  Cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard-stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch dashboard stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const cards = [
    { label: 'Total Products', value: stats?.totalProducts ?? 0, icon: <FiBox size={22} />, color: '#2F7D3A', href: '/admin/products' },
    { label: 'Total Orders', value: stats?.totalOrders ?? 0, icon: <FiShoppingBag size={22} />, color: '#1e40af', href: '/admin/orders' },
    { label: 'Total Customers', value: stats?.totalCustomers ?? 0, icon: <FiUsers size={22} />, color: '#7c3aed', href: '/admin/customers' },
    { label: 'Total Revenue', value: `Rs. ${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: <FiDollarSign size={22} />, color: '#b45309', href: '/admin/orders' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '6px' }}>Dashboard Overview</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Real-time snapshot of your store</p>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {cards.map((card) => (
          <Link key={card.label} href={card.href} style={{ textDecoration: 'none' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '52px', height: '52px', borderRadius: '12px', backgroundColor: `${card.color}15`, color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {card.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '2px' }}>{card.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', whiteSpace: 'nowrap' }}>{card.value}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Alerts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <Link href="/admin/orders" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid #f59e0b' }}>
            <FiClock size={22} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pending Orders</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>{stats?.pendingOrders ?? 0}</div>
            </div>
          </div>
        </Link>
        <Link href="/admin/inventory" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid #ef4444' }}>
            <FiAlertTriangle size={22} color="#ef4444" />
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Low Stock Products</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>{stats?.lowStockProducts?.length ?? 0}</div>
            </div>
          </div>
        </Link>
        <Link href="/admin/reviews" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: '4px solid #3b82f6' }}>
            <FiStar size={22} color="#3b82f6" />
            <div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Pending Reviews</div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text)' }}>{stats?.pendingReviews ?? 0}</div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders + Low Stock side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '16px' }} data-dashboard-bottom-grid>
        {/* Recent Orders */}
        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>Recent Orders</h3>
            <Link href="/admin/orders" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <FiArrowRight size={14} />
            </Link>
          </div>

          {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>No orders yet</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>Customer</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>Items</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '8px', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '10px 8px', fontWeight: '600' }}>{order.customerName}</td>
                      <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{order.itemsCount}</td>
                      <td style={{ padding: '10px 8px', fontWeight: '600' }}>Rs. {order.total?.toLocaleString()}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span style={{ backgroundColor: statusColors[order.orderStatus]?.bg, color: statusColors[order.orderStatus]?.text, padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)' }}>Low Stock Alert</h3>
            <Link href="/admin/inventory" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <FiArrowRight size={14} />
            </Link>
          </div>

          {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) ? (
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>All products well stocked 🎉</p>
          ) : (
            <div>
              {stats.lowStockProducts.map((product) => (
                <div key={product._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '16px' }}>📦</span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: product.stock === 0 ? '#ef4444' : '#f59e0b', flexShrink: 0 }}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          [data-dashboard-bottom-grid] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
