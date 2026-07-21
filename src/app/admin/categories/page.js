'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiTag, FiArrowRight } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';

const categories = [
  { name: 'Dog Medicines', icon: '🐕' },
  { name: 'Cat Medicines', icon: '🐈' },
  { name: 'Cat & Dog Medicines', icon: '🐾', combined: true },
  { name: 'Bird Medicines', icon: '🦜' },
  { name: 'Parasite Treatment', icon: '💊' },
  { name: 'Deworming', icon: '💊' },
  { name: 'Supplements', icon: '💊' },
  { name: 'Pet Food', icon: '🍖' },
  { name: 'Pain Relief & Symptomatic Care', icon: '💉' },
  { name: 'Skin & External Care', icon: '🧴' },
  { name: 'Equipment & Devices', icon: '🔧' },
  { name: 'Accessories', icon: '🎾' },
];

export default function AdminCategoriesPage() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await fetch('/api/products?admin=true');
      const products = await res.json();

      const newCounts = {};
      categories.forEach((cat) => {
        if (cat.combined) {
          newCounts[cat.name] = products.filter((p) =>
            ['Cat & Dog Medicines', 'Cat Medicines', 'Dog Medicines'].includes(p.category)
          ).length;
        } else {
          newCounts[cat.name] = products.filter((p) => p.category === cat.name).length;
        }
      });
      setCounts(newCounts);
    } catch (err) {
      console.error('Failed to fetch category counts', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading categories..." />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>Categories</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Product categories used across the store</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', fontSize: '13px', color: '#1e40af' }}>
        Categories are set directly on each product when adding or editing it from the <strong>Products</strong> section. This page shows a live overview of how many products fall under each category.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {categories.map((cat) => (
          <Link key={cat.name} href={`/shop?category=${encodeURIComponent(cat.name)}`} target="_blank" style={{ textDecoration: 'none' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px', transition: 'transform 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                {cat.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', marginBottom: '2px' }}>{cat.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{counts[cat.name] || 0} products</div>
              </div>
              <FiArrowRight size={16} color="var(--text-muted)" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
