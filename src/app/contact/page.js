'use client';
import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) {
      alert('Please fill all fields');
      return;
    }
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '20px 20px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '6px' }}>Contact Us</h1>
          <p style={{ opacity: 0.85, fontSize: '13px' }}>We'd love to hear from you. Get in touch with our team.</p>
        </div>
      </div>

      <div className="container" style={{ padding: '40px 20px', display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '28px', alignItems: 'start' }}>

        {/* Contact Info */}
        <div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)', marginBottom: '20px' }}>Get In Touch</h3>

            {[
              { icon: <FiMapPin size={20} />, title: 'Address', value: '123 Veterinary Street, Lahore, Pakistan' },
              { icon: <FiPhone size={20} />, title: 'Phone', value: '0300-1234567' },
              { icon: <FiMail size={20} />, title: 'Email', value: 'info@furrandfeathers.com' },
              { icon: <FiClock size={20} />, title: 'Working Hours', value: '9 AM - 9 PM, Mon - Sat' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#f0f1ff', color: 'var(--primary)', borderRadius: '10px', width: '42px', height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)', marginBottom: '2px' }}>{item.title}</p>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* WhatsApp Card */}
          <div style={{ backgroundColor: '#25D366', borderRadius: '16px', padding: '24px', color: 'white', textAlign: 'center' }}>
            <FaWhatsapp size={36} style={{ marginBottom: '10px' }} />
            <h3 style={{ fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>Chat With Us Instantly</h3>
            <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '16px' }}>Get quick answers on WhatsApp</p>
            <a href="https://wa.me/923001234567" target="_blank" style={{ backgroundColor: 'white', color: '#25D366', padding: '10px 24px', borderRadius: '8px', fontWeight: '700', textDecoration: 'none', fontSize: '14px', display: 'inline-block' }}>
              Open WhatsApp
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)', marginBottom: '24px' }}>Send Us a Message</h3>

          {sent && (
            <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '600' }}>
              ✅ Message sent successfully! We'll get back to you soon.
            </div>
          )}

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Enter your name"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Message</label>
            <textarea name="message" value={form.message} onChange={handleChange} rows={6} placeholder="Write your message here..."
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px', resize: 'vertical' }} />
          </div>

          <button onClick={handleSubmit} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
            Send Message
          </button>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="container" style={{ padding: '0 20px 40px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <FiMapPin size={40} style={{ marginBottom: '10px' }} />
            <p>Map will be embedded here</p>
          </div>
        </div>
      </div>
    </div>
  );
}