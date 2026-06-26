'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiPhone, FiMapPin } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/orders');
      const orders = await res.json();

      // Login system abhi functional nahi hai, isliye customers ko phone number se group karte hain
      const map = {};
      orders.forEach((order) => {
        const key = order.phone;
        if (!map[key]) {
          map[key] = {
            phone: order.phone,
            name: order.customerName,
            city: order.city,
            email: order.email,
            totalOrders: 0,
            totalSpent: 0,
            lastOrderDate: order.createdAt,
          };
        }
        map[key].totalOrders += 1;
        if (order.orderStatus !== 'Cancelled') {
          map[key].totalSpent += order.total || 0;
        }
        if (new Date(order.createdAt) > new Date(map[key].lastOrderDate)) {
          map[key].lastOrderDate = order.createdAt;
          map[key].name = order.customerName;
          map[key].city = order.city;
        }
      });

      const list = Object.values(map).sort((a, b) => new Date(b.lastOrderDate) - new Date(a.lastOrderDate));
      setCustomers(list);
    } catch (err) {
      console.error('Customers fetch nahi hui', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  if (loading) {
    return <LoadingSpinner text="Loading customers..." />;
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>Customers</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        Derived from order history — there's no customer login system yet, so customers are grouped by phone number.
      </p>

      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '320px' }}>
        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '650px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Phone</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>City</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Orders</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No customers found</td>
                </tr>
              ) : (
                filtered.map((customer) => (
                  <tr key={customer.phone} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>{customer.name}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPhone size={12} /> {customer.phone}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiMapPin size={12} /> {customer.city}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: '#eff6ff', color: '#1e40af', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '700' }}>Rs. {customer.totalSpent.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
