'use client';
import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX, FiUploadCloud, FiExternalLink, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

const emptyForm = {
  title: '', slug: '', content: '', excerpt: '', category: 'General', author: 'Admin',
  isPublished: false, metaTitle: '', metaDescription: '', focusKeyword: '',
};

const categories = ['General', 'Dog Care', 'Cat Care', 'Bird Care'];

export default function AdminSeoPage() {
  const [activeTab, setActiveTab] = useState('blogs'); // blogs | seo-tools
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error('Blogs fetch nahi hui', err);
      toast.error('Blogs load nahi hue');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const openNewForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEditForm = (blog) => {
    setForm({
      title: blog.title, slug: blog.slug, content: blog.content, excerpt: blog.excerpt || '',
      category: blog.category || 'General', author: blog.author || 'Admin',
      isPublished: blog.isPublished, metaTitle: blog.metaTitle || '', metaDescription: blog.metaDescription || '',
      focusKeyword: blog.focusKeyword || '',
    });
    setEditingId(blog._id);
    setImageFile(null);
    setImagePreview(blog.image || null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title aur content zaroori hain');
      return;
    }
    setSaving(true);
    try {
      let imageUrl = imagePreview && !imageFile ? imagePreview : '';

      // Agar nayi image select ki hai to upload karo
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.message || 'Image upload nahi hui');
        imageUrl = uploadData.url;
      }

      const payload = { ...form, image: imageUrl };
      const url = editingId ? `/api/blogs/${editingId}` : '/api/blogs';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Save nahi hua');
        return;
      }

      if (editingId) {
        setBlogs((prev) => prev.map((b) => (b._id === editingId ? data : b)));
        toast.success('Blog update ho gaya');
      } else {
        setBlogs((prev) => [data, ...prev]);
        toast.success('Blog ban gaya');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.message || 'Kuch ghalat ho gaya');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const res = await fetch(`/api/blogs/${blog._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !blog.isPublished }),
      });
      if (!res.ok) throw new Error('fail');
      setBlogs((prev) => prev.map((b) => (b._id === blog._id ? { ...b, isPublished: !blog.isPublished } : b)));
      toast.success(!blog.isPublished ? 'Blog publish ho gaya' : 'Blog unpublish ho gaya');
    } catch (err) {
      toast.error('Kuch ghalat ho gaya');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/blogs/${deleteTarget._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('fail');
      setBlogs((prev) => prev.filter((b) => b._id !== deleteTarget._id));
      toast.success('Blog delete ho gaya');
    } catch (err) {
      toast.error('Delete nahi hua');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading..." />;
  }

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>SEO Manager</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>Blog posts aur SEO settings yahan se manage karein</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid var(--border)' }}>
        {[
          { key: 'blogs', label: '📝 Blog Posts' },
          { key: 'seo-tools', label: '🔍 SEO Tools' },
        ].map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '10px 20px', border: 'none', borderBottom: `3px solid ${activeTab === tab.key ? 'var(--primary)' : 'transparent'}`,
              backgroundColor: 'transparent', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              color: activeTab === tab.key ? 'var(--primary)' : 'var(--text-muted)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== BLOG POSTS TAB ===== */}
      {activeTab === 'blogs' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{blogs.length} blog posts • {blogs.filter(b => b.isPublished).length} published</p>
            <button onClick={openNewForm} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px' }}>
              <FiPlus size={16} /> New Blog Post
            </button>
          </div>

          {blogs.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              Koi blog post nahi hai. "New Blog Post" par click kar ke pehla post banayein.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {blogs.map((blog) => (
                <div key={blog._id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '8px', backgroundColor: 'var(--bg)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                    {blog.image ? <img src={blog.image} alt={blog.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📄'}
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px' }}>{blog.title}</span>
                      <span style={{
                        fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                        backgroundColor: blog.isPublished ? '#dcfce7' : '#f3f4f6',
                        color: blog.isPublished ? '#166534' : '#6b7280',
                      }}>
                        {blog.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{blog.category} • /blog/{blog.slug}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {blog.isPublished && (
                      <a href={`/blog/${blog.slug}`} target="_blank" rel="noopener noreferrer" title="View live"
                        style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: '#eff6ff', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                        <FiExternalLink size={14} />
                      </a>
                    )}
                    <button onClick={() => handleTogglePublish(blog)} title={blog.isPublished ? 'Unpublish' : 'Publish'}
                      style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', backgroundColor: blog.isPublished ? '#fef3c7' : '#dcfce7', color: blog.isPublished ? '#92400e' : '#166534', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {blog.isPublished ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                    <button onClick={() => openEditForm(blog)} title="Edit"
                      style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', backgroundColor: '#f0f1ff', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiEdit2 size={14} />
                    </button>
                    <button onClick={() => setDeleteTarget(blog)} title="Delete"
                      style={{ width: '34px', height: '34px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#991b1b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== SEO TOOLS TAB ===== */}
      {activeTab === 'seo-tools' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>🗺️ Sitemap & Robots</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.6' }}>
              Yeh dono files automatically generate hoti hain — sab products, blog posts, aur pages inme shamil hote hain. Google Search Console mein sitemap URL submit karein taake site jaldi index ho.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FiExternalLink size={14} /> View Sitemap
              </a>
              <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="btn-outline" style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <FiExternalLink size={14} /> View Robots.txt
              </a>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>📦 Product SEO</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Har product apna khud ka meta title, meta description, aur focus keyword rakh sakta hai — yeh <strong>Products</strong> section mein product add/edit karte waqt set hota hai. Jo products yeh fields khali chhorte hain, unke liye product ka naam aur description automatically use ho jati hai.
            </p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>⭐ Rich Results (Schema Markup)</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Har product page par automatically Product Schema (JSON-LD) add hota hai — jisse Google search results mein price, stock availability, aur star rating dikhai deti hai. Koi extra setup ki zaroorat nahi.
            </p>
          </div>
        </div>
      )}

      {/* ===== BLOG FORM MODAL ===== */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 2000, padding: '30px 20px', overflowY: 'auto' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '28px', maxWidth: '640px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontWeight: '700', fontSize: '18px' }}>{editingId ? 'Edit Blog Post' : 'New Blog Post'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX size={22} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Best Deworming Medicine for Dogs"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  URL Slug <span style={{ fontWeight: '400', color: 'var(--text-muted)' }}>(khali chhod dein to title se automatically ban jayega)</span>
                </label>
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="best-deworming-medicine-dogs"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }}>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Author</label>
                  <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Featured Image</label>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                {!imagePreview ? (
                  <div onClick={() => fileInputRef.current?.click()}
                    style={{ border: '2px dashed var(--primary)', borderRadius: '10px', padding: '20px', backgroundColor: '#F0FBF1', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <FiUploadCloud size={22} color="var(--primary)" />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>Click to upload image</span>
                  </div>
                ) : (
                  <div style={{ position: 'relative', width: '120px' }}>
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '2px solid var(--border)' }} />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#ef4444', color: 'white', border: '2px solid white', cursor: 'pointer' }}>
                      <FiX size={12} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Excerpt (short summary)</label>
                <textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2}
                  placeholder="Chhota sa summary jo blog list mein dikhega"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Content *</label>
                <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={8}
                  placeholder="Poora blog content yahan likhein. Naye paragraph ke liye Enter dabayein."
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px' }}>SEO Settings (optional)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Meta Title</label>
                    <input type="text" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      placeholder="Khali ho to blog title use hoga"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Meta Description</label>
                    <input type="text" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      placeholder="Khali ho to excerpt use hoga"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '5px', color: 'var(--text-muted)' }}>Focus Keyword</label>
                    <input type="text" value={form.focusKeyword} onChange={(e) => setForm({ ...form, focusKeyword: e.target.value })}
                      placeholder="e.g. dog deworming medicine"
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '13px' }} />
                  </div>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  style={{ width: '16px', height: '16px' }} />
                Publish immediately (website par turant dikhega)
              </label>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn-outline" style={{ flex: 1, padding: '12px' }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary" style={{ flex: 1, padding: '12px', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : editingId ? 'Update Blog' : 'Create Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION ===== */}
      {deleteTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '24px', maxWidth: '380px', width: '100%' }}>
            <h3 style={{ fontWeight: '700', fontSize: '17px', marginBottom: '10px' }}>Delete this blog post?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              <strong>{deleteTarget.title}</strong> permanently delete ho jayega. Yeh wapas nahi ho sakta.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteTarget(null)} className="btn-outline" style={{ flex: 1, padding: '10px' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#ef4444', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
