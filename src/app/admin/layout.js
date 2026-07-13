'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiGrid, FiBox, FiTag, FiShoppingBag, FiUsers,
  FiStar, FiPackage, FiCreditCard, FiSearch, FiSettings, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';

const menuItems = [
  { label: 'Dashboard', icon: <FiGrid />, href: '/admin' },
  { label: 'Products', icon: <FiBox />, href: '/admin/products' },
  { label: 'Categories', icon: <FiTag />, href: '/admin/categories' },
  { label: 'Orders', icon: <FiShoppingBag />, href: '/admin/orders' },
  { label: 'Customers', icon: <FiUsers />, href: '/admin/customers' },
  { label: 'Reviews', icon: <FiStar />, href: '/admin/reviews' },
  { label: 'Inventory', icon: <FiPackage />, href: '/admin/inventory' },
  { label: 'Payments', icon: <FiCreditCard />, href: '/admin/payments' },
  { label: 'SEO Manager', icon: <FiSearch />, href: '/admin/seo' },
  { label: 'Settings', icon: <FiSettings />, href: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminName, setAdminName] = useState('Admin');

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.name) setAdminName(data.user.name);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      router.push('/account');
      router.refresh();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5FA' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '0px',
        backgroundColor: 'var(--primary)',
        color: 'white',
        transition: 'width 0.3s',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Logo — fixed at top, never scrolls */}
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image src="/footer.png" alt="Furr & Feather's Hospital" width={400} height={120} style={{ objectFit: 'contain', width: '180px', height: 'auto' }} />
          </div>
        </div>

        {/* Nav — scrollable, logout pinned at bottom */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 12px 8px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}>
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 14px', borderRadius: '8px', marginBottom: '4px',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                    color: 'white', fontSize: '14px', fontWeight: isActive ? '600' : '400',
                    transition: 'background 0.2s', whiteSpace: 'nowrap',
                  }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}>
                    <span style={{ fontSize: '17px', display: 'flex' }}>{item.icon}</span>
                    {item.label}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout — always visible at bottom, never hidden */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', padding: '12px', flexShrink: 0 }}>
            <button onClick={handleLogout} disabled={loggingOut}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                padding: '11px 14px', borderRadius: '8px', color: 'white', fontSize: '14px',
                background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                opacity: loggingOut ? 0.6 : 1, whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <FiLogOut size={17} /> {loggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ backgroundColor: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--text)' }}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Welcome back, {adminName} 👋</span>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>
              {adminName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}