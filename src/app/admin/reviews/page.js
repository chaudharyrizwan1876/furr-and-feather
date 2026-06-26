'use client';
import { useState, useEffect } from 'react';
import { FiCheck, FiX, FiTrash2, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

function StarRow({ rating }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <FiStar key={star} size={13} style={{ color: star <= rating ? '#f59e0b' : '#d1d5db', fill: star <= rating ? '#f59e0b' : 'none' }} />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | pending | approved
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error('Reviews fetch nahi hui', err);
      toast.error('Reviews load nahi hui');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, isApproved) => {
    try {
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved }),
      });
      if (!res.ok) throw new Error('Update fail');
      setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, isApproved } : r)));
      toast.success(isApproved ? 'Review approve ho gaya' : 'Review reject ho gaya');
    } catch (err) {
      toast.error('Kuch ghalat ho gaya');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/reviews/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete fail');
      setReviews((prev) => prev.filter((r) => r._id !== deleteTarget._id));
      toast.success('Review delete ho gaya');
    } catch (err) {
      toast.error('Delete nahi hua');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (filter === 'pending') return !r.isApproved;
    if (filter === 'approved') return r.isApproved;
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Loading reviews..." />;
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>Reviews</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>Customer reviews waiting for approval or already live on your store</p>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All (${reviews.length})` },
          { key: 'pending', label: `Pending (${reviews.filter((r) => !r.isApproved).length})` },
          { key: 'approved', label: `Approved (${reviews.filter((r) => r.isApproved).length})` },
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
          No reviews {filter !== 'all' ? `in "${filter}"` : ''} yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((review) => (
            <div key={review._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '700', fontSize: '14px' }}>{review.customerName}</span>
                    <StarRow rating={review.rating} />
                    <span style={{
                      fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                      backgroundColor: review.isApproved ? '#dcfce7' : '#fef3c7',
                      color: review.isApproved ? '#166534' : '#92400e',
                    }}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    On: <strong>{review.product?.name || 'Unknown product'}</strong>
                  </p>
                  <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: '1.6' }}>{review.comment}</p>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {!review.isApproved ? (
                    <button onClick={() => handleApprove(review._id, true)}
                      title="Approve"
                      style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', backgroundColor: '#dcfce7', color: '#166534', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiCheck size={16} />
                    </button>
                  ) : (
                    <button onClick={() => handleApprove(review._id, false)}
                      title="Unapprove"
                      style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', backgroundColor: '#fef3c7', color: '#92400e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiX size={16} />
                    </button>
                  )}
                  <button onClick={() => setDeleteTarget(review)}
                    title="Delete"
                    style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#991b1b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', maxWidth: '380px', width: '100%' }}>
            <h3 style={{ fontWeight: '700', fontSize: '17px', marginBottom: '10px' }}>Delete this review?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              This review from <strong>{deleteTarget.customerName}</strong> will be permanently removed. This cannot be undone.
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
