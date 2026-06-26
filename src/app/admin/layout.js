'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FiGrid, FiBox, FiTag, FiShoppingBag, FiUsers, FiFileText,
  FiStar, FiPackage, FiPercent, FiCreditCard, FiSearch, FiSettings, FiLogOut, FiMenu, FiX
} from 'react-icons/fi';

const menuItems = [
  { label: 'Dashboard', icon: <FiGrid />, href: '/admin' },
  { label: 'Products', icon: <FiBox />, href: '/admin/products' },
  { label: 'Categories', icon: <FiTag />, href: '/admin/categories' },
  { label: 'Orders', icon: <FiShoppingBag />, href: '/admin/orders' },
  { label: 'Customers', icon: <FiUsers />, href: '/admin/customers' },
  { label: 'Blog', icon: <FiFileText />, href: '/admin/blogs' },
  { label: 'Reviews', icon: <FiStar />, href: '/admin/reviews' },
  { label: 'Inventory', icon: <FiPackage />, href: '/admin/inventory' },
  { label: 'Coupons', icon: <FiPercent />, href: '/admin/coupons' },
  { label: 'Payments', icon: <FiCreditCard />, href: '/admin/payments' },
  { label: 'SEO Manager', icon: <FiSearch />, href: '/admin/seo' },
  { label: 'Settings', icon: <FiSettings />, href: '/admin/settings' },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5FA' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '260px' : '0px',
        backgroundColor: 'var(--primary)',
        color: 'white',
        transition: 'width 0.3s',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '6px 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Image src="/logo.png" alt="Furr & Feather's Hospital" width={220} height={70} style={{ objectFit: 'contain', width: '120px', height: '38px' }} />
          </div>
          <div style={{ whiteSpace: 'nowrap' }}>
            <div style={{ fontWeight: '800', fontSize: '14px' }}>Furr & Feather's</div>
            <div style={{ fontSize: '11px', opacity: 0.75 }}>Admin Panel</div>
          </div>
        </div>

        <nav style={{ padding: '16px 12px' }}>
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

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: '12px', paddingTop: '12px' }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 14px', borderRadius: '8px', color: 'white', fontSize: '14px' }}>
                <FiLogOut size={17} /> Logout
              </div>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ backgroundColor: 'white', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--text)' }}>
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Welcome back, Admin 👋</span>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '14px' }}>A</div>
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