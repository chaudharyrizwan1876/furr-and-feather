'use client';
import Link from 'next/link';

const post = {
  title: 'Best Deworming Medicine for Dogs in Pakistan',
  category: 'Dog Care',
  date: 'May 18, 2024',
  author: 'Admin',
  image: '🐕',
  content: [
    'Deworming your dog regularly is one of the most important parts of responsible pet ownership. Intestinal worms can cause serious health problems if left untreated, ranging from mild digestive upset to severe weight loss and anemia.',
    'In Pakistan, the most common worms affecting dogs include roundworms, hookworms, tapeworms, and whipworms. Puppies should be dewormed starting at 2 weeks of age, then every 2 weeks until 12 weeks old, followed by monthly treatments until 6 months.',
    'For adult dogs, deworming every 3 months is generally recommended, though this can vary based on lifestyle factors like outdoor exposure and contact with other animals.',
    'Some of the most trusted deworming medicines available include Drontal Plus, Milbemax, and Panacur. Always consult with your veterinarian before starting any deworming program, especially for puppies, pregnant dogs, or dogs with existing health conditions.',
  ],
};

const relatedPosts = [
  { title: 'Dog Vaccination Schedule', slug: 'dog-vaccination-schedule', image: '🐕' },
  { title: 'Dog Skin Infection Treatment', slug: 'dog-skin-infection-treatment', image: '🐕' },
];

export default function BlogDetailPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div style={{ backgroundColor: 'white', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Home</Link>
          {' → '}
          <Link href="/blog" style={{ color: 'var(--primary)', textDecoration: 'none' }}>Blog</Link>
          {' → '} {post.title}
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
          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)' }}>Share this article:</span>
            <button style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', backgroundColor: '#1877f2', color: 'white', cursor: 'pointer', fontSize: '13px' }}>Facebook</button>
            <button style={{ padding: '6px 16px', borderRadius: '20px', border: 'none', backgroundColor: '#25D366', color: 'white', cursor: 'pointer', fontSize: '13px' }}>WhatsApp</button>
          </div>
        </div>

        {/* Related Posts */}
        <div style={{ marginTop: '28px' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '16px' }}>Related Articles</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
      </div>
    </div>
  );
}