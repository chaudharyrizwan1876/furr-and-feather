'use client';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', minHeight: '300px' }}>
      <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '16px' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '4px solid var(--bg)',
        }} />
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: '4px solid var(--primary)',
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🐾</span>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500' }}>{text}</p>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}