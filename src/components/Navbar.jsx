'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import useCartStore from '@/store/useCartStore';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
   const totalItems = useCartStore((state) => state.totalItems);

  useEffect(() => setMounted(true), []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Track Order', href: '/track-order' },
  ];

  return (
    <nav style={{ backgroundColor: 'var(--white)', boxShadow: '0 2px 10px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Top Bar */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', textAlign: 'center', padding: '6px', fontSize: '13px' }}>
        Same day COD available only in Rawalpindi | Islamabad
      </div>

      {/* Main Navbar */}
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '3px 20px' }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', marginLeft: '-30px' }} className="navbar-logo-link">
          <div style={{ height: '72px', width: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}
            className="navbar-logo-box">
            <Image src="/logo.png" alt="Furr & Feather's Hospital" width={320} height={144} style={{ objectFit: 'contain', width: '240px', height: 'auto' }} />
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }} className="desktop-nav">
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <span style={{
                display: 'inline-block',
                padding: '8px 14px',
                borderRadius: '8px',
                color: 'var(--text)',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text)'; }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Right Icons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setSearchOpen(!searchOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '20px', padding: '8px', borderRadius: '50%', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <FiSearch />
          </button>
          <Link href="/account" style={{ color: 'var(--text)', fontSize: '20px', padding: '8px', borderRadius: '50%', transition: 'background 0.2s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <FiUser />
          </Link>
          <Link href="/cart" style={{ position: 'relative', color: 'var(--text)', fontSize: '20px', padding: '8px', borderRadius: '50%', transition: 'background 0.2s', display: 'flex' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            <FiShoppingCart />
            <span style={{ position: 'absolute', top: '0px', right: '0px', backgroundColor: 'var(--accent)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>{mounted ? totalItems : 0}</span>
          </Link>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', color: 'var(--text)', display: 'none' }} className="mobile-menu-btn">
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg)' }}>
          <div className="container" style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search for medicines, products..."
              style={{ flex: 1, padding: '10px 16px', borderRadius: '8px', border: '2px solid var(--primary)', outline: 'none', fontSize: '14px' }}
            />
            <button className="btn-primary" style={{ padding: '10px 20px' }}>Search</button>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--white)' }}>
          {navLinks.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 0', color: 'var(--text)', textDecoration: 'none', borderBottom: '1px solid var(--border)', fontWeight: '500' }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}

      <style jsx>{`
        @media (max-width: 860px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
          .navbar-logo-link {
            margin-left: 0 !important;
          }
          .navbar-logo-box {
            width: 170px !important;
            height: 56px !important;
          }
        }
        @media (max-width: 420px) {
          .navbar-logo-box {
            width: 140px !important;
            height: 48px !important;
          }
        }
      `}</style>
    </nav>
  );
}