'use client';
import { useState, useEffect } from 'react';
import { FiSearch, FiAlertTriangle } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all | low | out

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?admin=true');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Inventory fetch nahi hui', err);
    } finally {
      setLoading(false);
    }
  };

  // Har product ka effective stock — agar variants hain to unka sum, warna base stock
  const getEffectiveStock = (product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return product.stock || 0;
  };

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => {
      const stock = getEffectiveStock(p);
      if (filter === 'low') return stock > 0 && stock <= 5;
      if (filter === 'out') return stock === 0;
      return true;
    });

  const lowStockCount = products.filter((p) => { const s = getEffectiveStock(p); return s > 0 && s <= 5; }).length;
  const outOfStockCount = products.filter((p) => getEffectiveStock(p) === 0).length;

  if (loading) {
    return <LoadingSpinner text="Loading inventory..." />;
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>Inventory</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>Live stock levels across all products. Stock is updated from the Products section.</p>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All Products (${products.length})` },
          { key: 'low', label: `Low Stock (${lowStockCount})` },
          { key: 'out', label: `Out of Stock (${outOfStockCount})` },
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

      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '320px' }}>
        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Product</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Variants</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Stock</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No products found</td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const stock = getEffectiveStock(product);
                  const hasVariants = product.variants && product.variants.length > 0;
                  return (
                    <tr key={product._id} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: 'var(--bg)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : <span style={{ fontSize: '14px' }}>📦</span>}
                          </div>
                          <span style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>{product.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{product.category}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                        {hasVariants ? `${product.variants.length} variants` : '—'}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '700' }}>{stock}</td>
                      <td style={{ padding: '12px 16px' }}>
                        {stock === 0 ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                            <FiAlertTriangle size={11} /> Out of Stock
                          </span>
                        ) : stock <= 5 ? (
                          <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                            Low ({stock} left)
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                            In Stock
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
