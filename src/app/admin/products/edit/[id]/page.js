'use client';
import { useState, useEffect, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';

export default function EditProductPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [form, setForm] = useState({
    name: '', category: 'Dog Medicines', brand: '', price: '', discountPrice: '',
    sku: '', stock: '', unit: 'Box', suitableFor: '', shortDescription: '', description: '', isActive: true,
  });
  const [hasVariants, setHasVariants] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState([{ label: '', price: '', stock: '' }]);
  const fileInputRef = useRef(null);
  const [existingImage, setExistingImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) {
        setError('Product not found');
        return;
      }
      const data = await res.json();

      setForm({
        name: data.name || '',
        category: data.category || 'Dog Medicines',
        brand: data.brand || '',
        price: data.price || '',
        discountPrice: data.discountPrice || '',
        sku: data.sku || '',
        stock: data.stock || '',
        unit: data.unit || 'Box',
        suitableFor: data.suitableFor || '',
        shortDescription: data.shortDescription || '',
        description: data.description || '',
        isActive: data.isActive,
      });

      setIsFeatured(data.isFeatured || false);

      if (data.variants && data.variants.length > 0) {
        setHasVariants(true);
        setVariants(data.variants.map(v => ({ label: v.label, price: v.price, stock: v.stock })));
      }

      if (data.images && data.images[0]) {
        setExistingImage(data.images[0]);
      }
    } catch (err) {
      setError('Could not load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const addVariantRow = () => setVariants([...variants, { label: '', price: '', stock: '' }]);
  const removeVariantRow = (index) => setVariants(variants.filter((_, i) => i !== index));
  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleSubmit = async (publishStatus) => {
    setError('');

    if (!form.name) {
      setError('Product name is required');
      return;
    }

    let validVariants = [];
    if (hasVariants) {
      validVariants = variants.filter(v => v.label && v.price && v.stock !== '');
      if (validVariants.length === 0) {
        setError('Please add at least one variant with label, price and stock');
        return;
      }
    } else {
      if (!form.price || form.stock === '') {
        setError('Price and stock are required');
        return;
      }
    }

    setSaving(true);

    try {
      let imageUrl = existingImage;

      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          throw new Error(uploadData.message || 'Image upload failed');
        }
        imageUrl = uploadData.url;
      }

      const basePrice = hasVariants
        ? Math.min(...validVariants.map(v => Number(v.price)))
        : Number(form.price);
      const baseStock = hasVariants
        ? validVariants.reduce((sum, v) => sum + Number(v.stock), 0)
        : Number(form.stock);

      const updateRes = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          category: form.category,
          brand: form.brand,
          price: basePrice,
          discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
          sku: form.sku,
          stock: baseStock,
          unit: form.unit,
          suitableFor: form.suitableFor,
          shortDescription: form.shortDescription,
          description: form.description || form.shortDescription || form.name,
          images: imageUrl ? [imageUrl] : [],
          variants: hasVariants ? validVariants.map(v => ({ label: v.label, price: Number(v.price), stock: Number(v.stock) })) : [],
          isFeatured: isFeatured,
          isActive: publishStatus !== undefined ? publishStatus : form.isActive,
        }),
      });

      const updateData = await updateRes.json();

      if (!updateRes.ok) {
        throw new Error(updateData.message || 'Could not update product');
      }

      router.push('/admin/products');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Loading product...</p>;
  }

  if (error && !form.name) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
        <button onClick={() => router.push('/admin/products')} className="btn-primary">Back to Products</button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text)', marginBottom: '20px' }}>Edit Product</h1>

      <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            ❌ {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Product Name *</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Bravecto Chewable Tablet"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Category *</label>
            <select name="category" value={form.category} onChange={handleChange}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }}>
              {['Dog Medicines', 'Cat Medicines', 'Cat & Dog Medicines', 'Bird Medicines', 'Supplements', 'Pet Food', 'Accessories', 'Parasite Treatment', 'Deworming', 'Equipment & Devices', 'Pain Relief & Symptomatic Care', 'Skin & External Care'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Brand</label>
            <input type="text" name="brand" value={form.brand} onChange={handleChange} placeholder="e.g. MSD"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>SKU</label>
            <input type="text" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. BRV-2040"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Suitable For (Weight/Strength)</label>
          <input type="text" name="suitableFor" value={form.suitableFor} onChange={handleChange} placeholder="e.g. Dogs & Cats, all weights"
            style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'var(--bg)', borderRadius: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: hasVariants ? '16px' : 0 }}>
            <input type="checkbox" checked={hasVariants} onChange={(e) => setHasVariants(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            This product has multiple weight/size options with different prices
          </label>

          {hasVariants ? (
            <div>
              {variants.map((variant, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                  <input type="text" placeholder="e.g. 4.5-10kg" value={variant.label} onChange={(e) => updateVariant(index, 'label', e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '13px' }} />
                  <input type="number" placeholder="Price (Rs.)" value={variant.price} onChange={(e) => updateVariant(index, 'price', e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '13px' }} />
                  <input type="number" placeholder="Stock" value={variant.stock} onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '13px' }} />
                  <button onClick={() => removeVariantRow(index)} disabled={variants.length === 1}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: variants.length === 1 ? 'not-allowed' : 'pointer', fontSize: '16px', opacity: variants.length === 1 ? 0.3 : 1 }}>
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              <button onClick={addVariantRow} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: '2px dashed var(--primary)', backgroundColor: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontSize: '13px', fontWeight: '600', marginTop: '6px' }}>
                <FiPlus size={14} /> Add Another Variant
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Price (Rs.) *</label>
                <input type="number" name="price" value={form.price} onChange={handleChange} placeholder="2450"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Discount Price (Rs.)</label>
                <input type="number" name="discountPrice" value={form.discountPrice} onChange={handleChange} placeholder="2800"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Stock Quantity *</label>
                <input type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="45"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
              </div>
            </div>
          )}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Unit</label>
          <select name="unit" value={form.unit} onChange={handleChange}
            style={{ width: '200px', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }}>
            {['Box', 'Bottle', 'Pack', 'Piece', 'Kg', 'Tablet', 'Syrup', 'Liquid'].map(u => <option key={u}>{u}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            Mark as Featured Product (shows on Home Page)
          </label>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Short Description</label>
          <input type="text" name="shortDescription" value={form.shortDescription} onChange={handleChange} placeholder="One line summary of the product"
            style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Full Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Detailed product description..."
            style={{ width: '100%', padding: '11px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px', resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Product Image</label>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />

          {!(imagePreview || existingImage) ? (
            <div onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--primary)', borderRadius: '12px', padding: '36px 20px',
                backgroundColor: '#F0FBF1', cursor: 'pointer', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                transition: 'background-color 0.2s', maxWidth: '320px',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#E3F7E5'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F0FBF1'}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <FiUploadCloud size={24} />
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', marginBottom: '2px' }}>Click here to upload an image</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PNG, JPG up to 5MB</p>
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '160px' }}>
              <div style={{ backgroundColor: 'var(--bg)', borderRadius: '10px', padding: '8px', border: '2px solid var(--border)' }}>
                <img src={imagePreview || existingImage} alt="Preview" style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '6px' }} />
              </div>
              <button type="button" onClick={handleRemoveImage} title="Remove image"
                style={{
                  position: 'absolute', top: '-8px', right: '-8px', width: '26px', height: '26px', borderRadius: '50%',
                  backgroundColor: '#ef4444', color: 'white', border: '2px solid white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                }}>
                <FiX size={14} />
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                style={{ marginTop: '8px', fontSize: '12px', fontWeight: '600', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                Change image
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => router.push('/admin/products')} disabled={saving}
            style={{ padding: '12px 24px', borderRadius: '8px', border: '2px solid var(--border)', backgroundColor: 'white', color: 'var(--text)', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            Cancel
          </button>
          <button onClick={() => handleSubmit(false)} disabled={saving}
            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#9CA3AF', color: 'white', fontWeight: '600', cursor: 'pointer', fontSize: '14px' }}>
            {saving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button onClick={() => handleSubmit(true)} disabled={saving}
            style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>
            {saving ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </div>
    </div>
  );
}