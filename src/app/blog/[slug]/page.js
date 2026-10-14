import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { toPlain } from '@/lib/serialize';
import BackButton from '@/components/BackButton';

async function getBlogData(slug) {
  await connectDB();
  const postDoc = await Blog.findOne({ slug, isPublished: true }).lean();
  if (!postDoc) return null;
  const post = toPlain(postDoc);

  const relatedDocs = await Blog.find({ category: post.category, isPublished: true, slug: { $ne: post.slug } })
    .limit(2)
    .lean();
  const relatedPosts = toPlain(relatedDocs);

  return { post, relatedPosts };
}

export default async function BlogDetailPage({ params }) {
  const { slug } = await params;
  const data = await getBlogData(slug);

  if (!data) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>📄</div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>Blog post not found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>This article doesn't exist or has been removed.</p>
          <Link href="/blog" className="btn-primary" style={{ display: 'inline-block', padding: '10px 24px' }}>Back to Blog</Link>
        </div>
      </div>
    );
  }

  const { post, relatedPosts } = data;
  // Split the content into paragraphs (if the admin separated paragraphs with a blank line)
  const paragraphs = post.content.split('\n').filter((p) => p.trim());

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <BackButton fallback="/blog" />
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
            <span>📅 {new Date(post.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span>✍️ By {post.author}</span>
          </div>

          {post.image && (
            <div style={{ backgroundColor: 'var(--bg)', height: '280px', borderRadius: '12px', overflow: 'hidden', marginBottom: '28px' }}>
              <img src={post.image} alt={post.title} loading="eager" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}

          {paragraphs.map((para, i) => (
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
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--bg)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                      {rp.image ? <img src={rp.image} alt={rp.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📄'}
                    </div>
                    <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>{rp.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 600px) {
          [data-related-grid] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
