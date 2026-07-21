'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

const categories = ['All', 'Dog Care', 'Cat Care', 'Bird Care', 'General'];

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs?published=true');
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error('Failed to fetch blogs', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedCategory === 'All' ? blogs : blogs.filter(p => p.category === selectedCategory);

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '20px 20px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '6px' }}>Our Pet Care Blog</h1>
          <p style={{ opacity: 0.85, fontSize: '13px' }}>Helpful tips and advice for your pet's health and wellbeing</p>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 20px' }}>
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ padding: '8px 20px', borderRadius: '20px', border: `2px solid ${selectedCategory === cat ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'white', color: selectedCategory === cat ? 'white' : 'var(--text)', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}>
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner text="Loading articles..." />
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: 'white', borderRadius: '14px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📝</div>
            <h3 style={{ marginBottom: '8px', color: 'var(--text)' }}>No articles found</h3>
            <p>New articles will be published soon!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {filtered.map((post) => (
              <Link key={post._id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.3s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(46,49,146,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}>
                  <div style={{ backgroundColor: 'var(--bg)', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '70px', overflow: 'hidden' }}>
                    {post.image ? (
                      <img src={post.image} alt={post.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : '📄'}
                  </div>
                  <div style={{ padding: '20px' }}>
                    <span style={{ backgroundColor: '#f0f1ff', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{post.category}</span>
                    <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text)', margin: '12px 0 8px', lineHeight: '1.4' }}>{post.title}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>{post.excerpt}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                      <span>{new Date(post.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span>By {post.author}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
