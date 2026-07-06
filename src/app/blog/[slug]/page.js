'use client';
import { use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { blogPosts } from '@/data/blogPosts';

export default function BlogDetailPage({ params }) {
  const router = useRouter();
  const { slug } = use(params);

  const post = blogPosts.find((p) => p.slug === slug);

  // Related posts — same category ke baqi posts, current post ko chhor kar
  const relatedPosts = post
    ? blogPosts.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 2)
    : [];

  if (!post) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📄</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>Blog post not found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Yeh article maujood nahi hai ya hata diya gaya hai.</p>
          <Link href="/blog" className="btn-primary" style={{ display: 'inline-block', padding: '10px 24px' }}>Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <button onClick={() => {
            if (typeof window !== 'undefined' && window.history.length > 1) {
              router.back();
            } else {
              router.push('/blog');
            }
          }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '0', marginBottom: '10px' }}>
            <FiArrowLeft size={15} /> Back
          </button>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
            {' → '}
            <Link href="/blog" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Blog</Link>
            {' → '} {post.title}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px', maxWidth: '800px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '36px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <span style={{ backgroundColor: '#f0f1ff', color: 'var(--primary)', padding: '5px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{post.category}</span>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text)', margin: '18px 0 14px', lineHeight: '1.3' }}>{post.title}</h1>

          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
            <span>📅 {post.date}</span>
            <span>✍️ By {post.author}</span>
          </div>

          <div style={{ backgroundColor: 'var(--bg)', height: '240px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '100px', marginBottom: '28px' }}>
            {post.image}
          </div>

          {post.content.map((para, i) => (
            <p key={i} style={{ fontSize: '15px', lineHeight: '1.9', color: 'var(--text)', marginBottom: '18px' }}>{para}</p>
          ))}

          {/* Share */}
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Share this article:</span>
            <button style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', backgroundColor: '#1877f2', color: 'white', cursor: 'pointer', fontSize: '13px' }}>Facebook</button>
            <button style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', backgroundColor: '#25D366', color: 'white', cursor: 'pointer', fontSize: '13px' }}>WhatsApp</button>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div style={{ marginTop: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px' }}>Related Articles</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}
              data-related-grid>
              {relatedPosts.map((rp) => (
                <Link key={rp.slug} href={`/blog/${rp.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                    <div style={{ fontSize: '36px' }}>{rp.image}</div>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>{rp.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @media (max-width: 600px) {
          [data-related-grid] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
