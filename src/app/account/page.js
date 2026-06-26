'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FaGoogle, FaFacebook } from 'react-icons/fa';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>

        {/* Tabs */}
        <div style={{ display: 'flex' }}>
          {['login', 'register'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ flex: 1, padding: '18px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px', textTransform: 'capitalize', backgroundColor: activeTab === tab ? 'var(--primary)' : 'var(--bg)', color: activeTab === tab ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: '32px' }}>
          {activeTab === 'login' ? (
            <>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '24px' }}>Welcome Back!</h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Email or Phone</label>
                <input type="text" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email or phone"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
              </div>

              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <a href="#" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>Forgot Password?</a>
              </div>

              <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px' }}>Login</button>

              <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
                <span style={{ backgroundColor: 'white', padding: '0 12px', color: 'var(--text-muted)', fontSize: '13px', position: 'relative', zIndex: 1 }}>Or continue with</span>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--border)' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid var(--border)', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaGoogle style={{ color: '#EA4335', fontSize: '16px' }} /> Google
                </button>
                <button style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid var(--border)', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaFacebook style={{ color: '#1877F2', fontSize: '16px' }} /> Facebook
                </button>
              </div>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <span onClick={() => setActiveTab('register')} style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Register</span>
              </p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '24px' }}>Create Account</h2>

              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter your full name' },
                { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter your email' },
                { label: 'Phone', name: 'phone', type: 'tel', placeholder: '03xxxxxxxxx' },
                { label: 'Password', name: 'password', type: 'password', placeholder: 'Create a password' },
              ].map((field) => (
                <div key={field.name} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>{field.label}</label>
                  <input type={field.type} name={field.name} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
                </div>
              ))}

              <button className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '8px' }}>Create Account</button>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <span onClick={() => setActiveTab('login')} style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Login</span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}