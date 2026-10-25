'use client';
import Link from 'next/link';
import { optimizedImage } from '@/lib/cloudinaryUrl';

// Just the hover effect needs the browser — kept as its own tiny client
// component so the rest of the home page stays server-rendered.
export default function CategoryCard({ href, image, icon, name, count }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px 14px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.3s', cursor: 'pointer', border: '2px solid transparent' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          {image ? (
            <img src={optimizedImage(image, 120)} alt={name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '30px' }}>{icon}</span>
          )}
        </div>
        <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text)', marginBottom: '4px' }}>{name}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{count} Products</div>
      </div>
    </Link>
  );
}
