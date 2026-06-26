'use client';
import { FiSearch } from 'react-icons/fi';

export default function AdminSeoPage() {
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>SEO Manager</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Manage meta tags, sitemap, and schema markup for your store</p>

      <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '50px 24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <FiSearch size={28} />
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>Coming Soon</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
          SEO tools — meta titles, descriptions, sitemap generation, and schema markup — are planned but not yet built. Each product already supports its own meta title, description, and focus keyword from the Products section.
        </p>
      </div>
    </div>
  );
}
