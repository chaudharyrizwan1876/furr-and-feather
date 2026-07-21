'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiArrowUp, FiArrowDown, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [orderMode, setOrderMode] = useState('shop'); // 'shop' | 'featured'
  const [reordering, setReordering] = useState(null); // productId currently being moved

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?admin=true');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products', err);
      toast.error('Products could not be loaded');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/products/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('fail');
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      toast.success('Product deleted');
    } catch (err) {
      toast.error('Could not delete');
    } finally {
      setDeleteTarget(null);
    }
  };

  // Build the list based on the order mode — in Shop order mode, all active products;
  // in Featured order mode, only show products that are featured
  const orderField = orderMode === 'featured' ? 'featuredOrder' : 'sortOrder';
  const orderedList = products
    .filter((p) => p.isActive !== false)
    .filter((p) => (orderMode === 'featured' ? p.isFeatured : true))
    .sort((a, b) => (a[orderField] || 0) - (b[orderField] || 0) || a._id.localeCompare(b._id));

  const handleMove = async (product, direction) => {
    setReordering(product._id);
    try {
      const res = await fetch('/api/products/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, direction, field: orderField }),
      });
      if (!res.ok) throw new Error('fail');
      await fetchProducts(); // Refresh so the new order is shown
    } catch (err) {
      toast.error('Order could not be updated');
    } finally {
      setReordering(null);
    }
  };

  const filtered = search.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : null; // Show the normal list while searching, otherwise the ordered list

  if (loading) {
    return <LoadingSpinner text="Loading products..." />;
  }

  const displayList = filtered || orderedList;
  const showReorderControls = !filtered; // Search ke doraan reorder arrows chhupao

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>Products</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{products.length} total products</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}>
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Order Mode Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[
          { key: 'shop', label: '🛍️ Shop Page Order' },
          { key: 'featured', label: '⭐ Featured Products Order' },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setOrderMode(tab.key)}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '2px solid', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              borderColor: orderMode === tab.key ? 'var(--primary)' : 'var(--border)',
              backgroundColor: orderMode === tab.key ? 'var(--primary)' : 'white',
              color: orderMode === tab.key ? 'white' : 'var(--text)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px', color: '#1e40af' }}>
        {orderMode === 'shop'
          ? 'Use the ↑↓ arrows to set the product order — this is the order shown on the Shop page.'
          : 'Use the ↑↓ arrows to set the order of Featured products — the top product will appear first on the Home page. (Only featured products are shown here)'}
      </div>

      <div style={{ position: 'relative', marginBottom: '16px', maxWidth: '320px' }}>
        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg)' }}>
                {showReorderControls && <th style={{ textAlign: 'center', padding: '12px 10px', color: 'var(--text-muted)', fontWeight: '600', width: '60px' }}>Order</th>}
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Product</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Stock</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={showReorderControls ? 7 : 6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    {orderMode === 'featured' && !filtered ? 'No featured products yet. Edit a product and check the "Featured" checkbox.' : 'No products found'}
                  </td>
                </tr>
              ) : (
                displayList.map((product, index) => (
                  <tr key={product._id} style={{ borderTop: '1px solid var(--border)' }}>
                    {showReorderControls && (
                      <td style={{ padding: '12px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                          <button onClick={() => handleMove(product, 'up')} disabled={index === 0 || reordering === product._id}
                            title="Move up"
                            style={{ width: '26px', height: '22px', border: 'none', borderRadius: '4px', backgroundColor: index === 0 ? '#f3f4f6' : '#f0f1ff', color: index === 0 ? '#d1d5db' : 'var(--primary)', cursor: index === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiArrowUp size={13} />
                          </button>
                          <button onClick={() => handleMove(product, 'down')} disabled={index === displayList.length - 1 || reordering === product._id}
                            title="Move down"
                            style={{ width: '26px', height: '22px', border: 'none', borderRadius: '4px', backgroundColor: index === displayList.length - 1 ? '#f3f4f6' : '#f0f1ff', color: index === displayList.length - 1 ? '#d1d5db' : 'var(--primary)', cursor: index === displayList.length - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FiArrowDown size={13} />
                          </button>
                        </div>
                      </td>
                    )}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'var(--bg)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : <span style={{ fontSize: '16px' }}>📦</span>}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {product.name}
                            {product.isFeatured && <FiStar size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{product.category}</td>
                    <td style={{ padding: '12px 16px', fontWeight: '600' }}>Rs. {product.price?.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>{product.stock}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        backgroundColor: product.isActive !== false ? '#dcfce7' : '#f3f4f6',
                        color: product.isActive !== false ? '#166534' : '#6b7280',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                      }}>
                        {product.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <Link href={`/admin/products/edit/${product._id}`}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0f1ff', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                          <FiEdit2 size={14} />
                        </Link>
                        <button onClick={() => setDeleteTarget(product)}
                          style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#991b1b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', maxWidth: '380px', width: '100%' }}>
            <h3 style={{ fontWeight: '700', fontSize: '17px', marginBottom: '10px' }}>Delete this product?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              <strong>{deleteTarget.name}</strong> will be permanently deleted.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteTarget(null)} className="btn-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
