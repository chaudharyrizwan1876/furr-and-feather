'use client';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

// Shared "Back" control used on breadcrumb bars — goes back in history when
// possible, otherwise falls back to a sensible parent page.
export default function BackButton({ fallback = '/', color = 'var(--primary)', className }) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <button onClick={handleClick} className={className}
      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color, cursor: 'pointer', fontSize: '13px', fontWeight: '600', padding: '0', marginBottom: '10px' }}>
      <FiArrowLeft size={15} /> Back
    </button>
  );
}
