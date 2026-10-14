import Link from 'next/link';

// Custom 404 — without this, Next.js serves a bare generic page for any
// unmatched URL. A branded one keeps visitors on-site and still correctly
// returns an HTTP 404 (so search engines don't treat these as real pages).
export default function NotFound() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>🐾</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text)', marginBottom: '10px' }}>Page Not Found</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
          Sorry, the page you're looking for doesn't exist or may have been moved.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn-primary">Back to Home</Link>
          <Link href="/shop" className="btn-outline">Browse Shop</Link>
        </div>
      </div>
    </div>
  );
}
