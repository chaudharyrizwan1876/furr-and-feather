'use client';
import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const emptyForm = {
  code: '',
  discountType: 'Percentage',
  discountValue: '',
  minPurchase: '',
  maxUsage: '100',
  expiryDate: '',
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch('/api/coupons');
      const data = await res.json();
      setCoupons(data);
    } catch (err) {
      console.error('Coupons fetch nahi hui', err);
      toast.error('Coupons load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error('fail');
      setCoupons((prev) => prev.map((c) => (c._id === coupon._id ? { ...c, isActive: !coupon.isActive } : c)));
      toast.success(!coupon.isActive ? 'Coupon activate ho gaya' : 'Coupon deactivate ho gaya');
    } catch (err) {
      toast.error('Kuch ghalat ho gaya');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/coupons/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('fail');
      setCoupons((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      toast.success('Coupon delete ho gaya');
    } catch (err) {
      toast.error('Delete nahi hua');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) {
      toast.error('Code aur discount value zaroori hai');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim().toUpperCase(),
          discountType: form.discountType,
          discountValue: Number(form.discountValue),
          minPurchase: Number(form.minPurchase) || 0,
          maxUsage: Number(form.maxUsage) || 100,
          expiryDate: form.expiryDate || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Coupon create nahi hua');
        return;
      }
      setCoupons((prev) => [data, ...prev]);
      toast.success('Coupon ban gaya');
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      toast.error('Kuch ghalat ho gaya');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading coupons..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>Coupons</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Create and manage discount codes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}>
          <FiPlus size={16} /> New Coupon
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '700px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Code</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Discount</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Min Purchase</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Usage</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', color: 'var(--text-muted)', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No coupons created yet</td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon._id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: '700', letterSpacing: '0.5px' }}>{coupon.code}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {coupon.discountType === 'Percentage' ? `${coupon.discountValue}% off`
                        : coupon.discountType === 'Fixed' ? `Rs. ${coupon.discountValue} off`
                        : 'Free Shipping'}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>Rs. {coupon.minPurchase?.toLocaleString() || 0}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{coupon.usedCount || 0} / {coupon.maxUsage}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleToggleActive(coupon)}
                        style={{
                          padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', border: 'none', cursor: 'pointer',
                          backgroundColor: coupon.isActive ? '#dcfce7' : '#f3f4f6',
                          color: coupon.isActive ? '#166534' : '#6b7280',
                        }}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setDeleteTarget(coupon)}
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#991b1b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiTrash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontWeight: '700', fontSize: '17px' }}>New Coupon</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Coupon Code</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g. WELCOME10" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', textTransform: 'uppercase' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Discount Type</label>
                <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none' }}>
                  <option value="Percentage">Percentage (%)</option>
                  <option value="Fixed">Fixed Amount (Rs.)</option>
                  <option value="FreeShipping">Free Shipping</option>
                </select>
              </div>
              {form.discountType !== 'FreeShipping' && (
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                    Discount Value {form.discountType === 'Percentage' ? '(%)' : '(Rs.)'}
                  </label>
                  <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none' }} />
                </div>
              )}
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Minimum Purchase (Rs.)</label>
                <input type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })}
                  placeholder="0" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Max Usage Count</label>
                <input type="number" value={form.maxUsage} onChange={(e) => setForm({ ...form, maxUsage: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Expiry Date (optional)</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, padding: '10px', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', maxWidth: '380px', width: '100%' }}>
            <h3 style={{ fontWeight: '700', fontSize: '17px', marginBottom: '10px' }}>Delete this coupon?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              <strong>{deleteTarget.code}</strong> will be permanently removed and can no longer be used at checkout.
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
