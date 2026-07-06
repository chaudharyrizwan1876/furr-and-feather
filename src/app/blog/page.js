'use client';
import { useState } from 'react';
import Link from 'next/link';
import { blogPosts, blogCategories } from '@/data/blogPosts';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = selectedCategory === 'All' ? blogPosts : blogPosts.filter(p => p.category === selectedCategory);

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
          {blogCategories.map((cat) => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              style={{ padding: '8px 20px', borderRadius: '20px', border: `2px solid ${selectedCategory === cat ? 'var(--primary)' : 'var(--border)'}`, backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'white', color: selectedCategory === cat ? 'white' : 'var(--text)', fontWeight: '600', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Blog Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {filtered.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', transition: 'all 0.3s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(46,49,146,0.15)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)'; }}>
                <div style={{ backgroundColor: 'var(--bg)', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '70px' }}>
                  {post.image}
                </div>
                <div style={{ padding: '20px' }}>
                  <span style={{ backgroundColor: '#f0f1ff', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>{post.category}</span>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text)', margin: '12px 0 8px', lineHeight: '1.4' }}>{post.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '14px' }}>{post.excerpt}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <span>{post.date}</span>
                    <span>By {post.author}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
