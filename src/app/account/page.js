'use client';
import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import toast from 'react-hot-toast';

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Session check — if the user is already logged in, show a simple
  // Logout-only view instead of the login form (more details added later)
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const redirectTo = searchParams.get('redirect') || '/';

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSocialClick = (provider) => {
    toast('This feature will be available soon', { icon: 'ℹ️' });
  };

  const redirectAfterAuth = (user) => {
    if (user.isAdmin) {
      router.push('/admin');
    } else {
      router.push(redirectTo === '/admin' ? '/' : redirectTo);
    }
    router.refresh();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Email and password are both required');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }
      toast.success(`Welcome back, ${data.user.name}!`);
      redirectAfterAuth(data.user);
    } catch (err) {
      setError('Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('Name, email and password are required');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Account could not be created');
        return;
      }
      toast.success('Account created!');
      redirectAfterAuth(data.user);
    } catch (err) {
      setError('Something went wrong, please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      toast.success('Logout ho gaye');
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  };

  // Session check hone tak halka loading state
  if (checkingSession) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  // If the user is already logged in — show just the simple Logout view
  // (name/email/order details will be added here later)
  if (currentUser) {
    return (
      <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '420px', padding: '36px 32px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '700', margin: '0 auto 16px' }}>
            {currentUser.name?.charAt(0).toUpperCase()}
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>Welcome, {currentUser.name}!</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '28px' }}>{currentUser.email}</p>

          <button onClick={handleLogout} disabled={loggingOut}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '13px', borderRadius: '8px', border: 'none', backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: '600', cursor: 'pointer', fontSize: '14px', opacity: loggingOut ? 0.7 : 1 }}>
            <FiLogOut size={17} /> {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '440px', overflow: 'hidden' }}>

        {/* Tabs */}
        <div style={{ display: 'flex' }}>
          {['login', 'register'].map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setError(''); }}
              style={{ flex: 1, padding: '18px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '15px', textTransform: 'capitalize', backgroundColor: activeTab === tab ? 'var(--primary)' : 'var(--bg)', color: activeTab === tab ? 'white' : 'var(--text-muted)', transition: 'all 0.2s' }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ padding: '32px' }}>
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px' }}>
              {error}
            </div>
          )}

          {activeTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '24px' }}>Welcome Back!</h2>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" autoComplete="email"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
              </div>

              <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Forgot Password? (coming soon)</span>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Signing in...' : 'Login'}
              </button>

              <div style={{ textAlign: 'center', margin: '20px 0', position: 'relative' }}>
                <span style={{ backgroundColor: 'white', padding: '0 12px', color: 'var(--text-muted)', fontSize: '13px', position: 'relative', zIndex: 1 }}>Or continue with</span>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: 'var(--border)' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => handleSocialClick('Google')}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid var(--border)', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaGoogle style={{ color: '#EA4335', fontSize: '16px' }} /> Google
                </button>
                <button type="button" onClick={() => handleSocialClick('Facebook')}
                  style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '2px solid var(--border)', backgroundColor: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <FaFacebook style={{ color: '#1877F2', fontSize: '16px' }} /> Facebook
                </button>
              </div>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                Don't have an account?{' '}
                <span onClick={() => { setActiveTab('register'); setError(''); }} style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Register</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text)', marginBottom: '24px' }}>Create Account</h2>

              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter your full name', autoComplete: 'name' },
                { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter your email', autoComplete: 'email' },
                { label: 'Phone', name: 'phone', type: 'tel', placeholder: '03xxxxxxxxx', autoComplete: 'tel' },
                { label: 'Password', name: 'password', type: 'password', placeholder: 'Create a password (6+ characters)', autoComplete: 'new-password' },
              ].map((field) => (
                <div key={field.name} style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>{field.label}</label>
                  <input type={field.type} name={field.name} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder} autoComplete={field.autoComplete}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid var(--border)', outline: 'none', fontSize: '14px' }} />
                </div>
              ))}

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
                Already have an account?{' '}
                <span onClick={() => { setActiveTab('login'); setError(''); }} style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}>Login</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Loading...
        </div>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
