'use client';
import { FiSettings } from 'react-icons/fi';

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', marginBottom: '4px' }}>Settings</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Store configuration and preferences</p>

      <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '50px 24px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f3f4f6', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <FiSettings size={28} />
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px' }}>Coming Soon</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
          Store-wide settings — admin login, business info, shipping rates, and notification preferences — are planned for a later phase.
        </p>
      </div>
    </div>
  );
}
