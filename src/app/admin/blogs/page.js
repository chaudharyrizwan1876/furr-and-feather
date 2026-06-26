'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FiSearch, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

const blogs = [
  { id: 1, title: 'Best Deworming Medicine for Dogs in Pakistan', category: 'Dog Care', author: 'Admin', status: 'Published', date: 'May 18, 2024' },
  { id: 2, title: 'Cat Vaccination Schedule: Complete Guide', category: 'Cat Care', author: 'Admin', status: 'Published', date: 'May 15, 2024' },
  { id: 3, title: 'How to Remove Fleas from Cats at Home', category: 'Cat Care', author: 'Admin', status: 'Published', date: 'May 10, 2024' },
  { id: 4, title: 'Signs of Skin Infection in Dogs', category: 'Dog Care', author: 'Admin', status: 'Draft', date: 'May 8, 2024' },
  { id: 5, title: 'Benefits of Multivitamins for Pets', category: 'Pet Health', author: 'Admin', status: 'Published', date: 'May 5, 2024' },
];

export default function BlogManagementPage() {
  const [search, setSearch] = useState('');

  const filtered = blogs.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text)' }}>Blog Posts</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Manage your blog content for SEO</p>
        </div>
        <Link href="/admin/blogs/new" style={{ textDecoration: 'none' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '11px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            <FiPlus /> Add New Post
          </button>
        </Link>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', backgroundColor: 'var(--bg)', borderRadius: '8px', padding: '10px 14px' }}>
          <FiSearch style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search blog posts..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', flex: 1, fontSize: '14px' }} />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Title', 'Category', 'Author', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 12px', fontWeight: '600', maxWidth: '300px' }}>{b.title}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{b.category}</td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{b.author}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ backgroundColor: b.status === 'Published' ? '#dcfce7' : '#fef9c3', color: b.status === 'Published' ? '#166534' : '#854d0e', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{b.date}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '16px' }}><FiEdit2 /></button>
                      <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px' }}><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}