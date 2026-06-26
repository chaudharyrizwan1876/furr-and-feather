'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiSearch, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ProductsListPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products?admin=true');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Products fetch nahi hue', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteTarget._id}`, { method: 'DELETE' });
      if (res.ok) {
        setProducts(products.filter(p => p._id !== deleteTarget._id));
        toast.success(`${deleteTarget.name} deleted successfully`);
      } else {
        toast.error('Could not delete product');
      }
    } catch (err) {
      toast.error('Could not delete product');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getDisplayPrice = (p) => {
    if (p.variants && p.variants.length > 0) {
      const prices = p.variants.map(v => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? `Rs. ${min.toLocaleString()}` : `Rs. ${min.toLocaleString()} - ${max.toLocaleString()}`;
    }
    return `Rs. ${p.price.toLocaleString()}`;
  };

  const getDisplayStock = (p) => {
    if (p.variants && p.variants.length > 0) {
      return p.variants.reduce((sum, v) => sum + v.stock, 0);
    }
    return p.stock;
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text)' }}>Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage your store products</p>
        </div>
        <Link href="/admin/products/new" style={{ textDecoration: 'none' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            <FiPlus /> Add New Product
          </button>
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', padding: '10px 14px' }}>
          <FiSearch style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', flex: 1, fontSize: '14px' }} />
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading products...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No products found. Click "Add New Product" to get started!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ backgroundColor: 'var(--bg)', borderRadius: '8px', width: '40px', height: '40px', overflow: 'hidden', flexShrink: 0 }}>
                          {p.images && p.images[0] ? (
                            <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                          )}
                        </div>
                        <span style={{ fontWeight: '600' }}>{p.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{p.category}</td>
                    <td style={{ padding: '14px 12px', fontWeight: '600' }}>{getDisplayPrice(p)}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ color: getDisplayStock(p) === 0 ? '#ef4444' : getDisplayStock(p) < 10 ? '#f59e0b' : 'var(--text)' }}>{getDisplayStock(p)}</span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ backgroundColor: p.isActive ? '#dcfce7' : '#fee2e2', color: p.isActive ? '#166534' : '#991b1b', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                        {p.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link href={`/admin/products/edit/${p._id}`} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '16px', display: 'flex' }}>
                          <FiEdit2 />
                        </Link>
                        <button onClick={() => setDeleteTarget(p)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div onClick={() => !deleting && setDeleteTarget(null)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', textAlign: 'center' }}>⚠️</div>
            <h3 style={{ fontWeight: '800', fontSize: '18px', color: 'var(--text)', marginBottom: '8px', textAlign: 'center' }}>Delete Product?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
              Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteTarget(null)} disabled={deleting}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid var(--border)', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: '600', opacity: deleting ? 0.7 : 1 }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}