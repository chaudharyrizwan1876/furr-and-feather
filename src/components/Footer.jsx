'use client';
import Link from 'next/link';
import Image from 'next/image';
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer style={{ backgroundColor: 'var(--primary)', color: 'white', marginTop: '40px' }}>
      <div className="container" style={{ padding: '28px 20px 18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', marginBottom: '24px' }}
          data-footer-grid>

          {/* Brand */}
          <div>
            <div style={{ height: '48px', width: '220px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', overflow: 'visible', marginBottom: '14px', borderRadius: '8px', padding: '4px 8px', position: 'relative' }}>
              <Image src="/footer.png" alt="Furr & Feather's Hospital" width={400} height={120} style={{ objectFit: 'contain', width: '210px', height: 'auto', position: 'absolute', left: 0 }} />
            </div>
            <p style={{ opacity: 0.8, fontSize: '13px', lineHeight: '1.6', marginBottom: '14px' }}>
              Trusted veterinary medicines & pet care products. Genuine products, fast delivery all over Pakistan.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { icon: <FaFacebook />, href: '#' },
                { icon: <FaInstagram />, href: '#' },
                { icon: <FaYoutube />, href: '#' },
                { icon: <FaWhatsapp />, href: '#' },
              ].map((s, i) => (
                <a key={i} href={s.href} style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

         {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '10px', fontSize: '14px' }}>Quick Links</h4>
            {[
              { label: 'Home', href: '/' },
              { label: 'Shop', href: '/shop' },
              { label: 'Blog', href: '/blog' },
              { label: 'About Us', href: '/about' },
              { label: 'Contact Us', href: '/contact' },
              { label: 'Track Order', href: '/track-order' },
            ].map((link) => (
              <Link key={link.href} href={link.href} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '6px', fontSize: '13px', transition: 'opacity 0.2s' }}
                onMouseEnter={e => e.target.style.opacity = '1'}
                onMouseLeave={e => e.target.style.opacity = '0.8'}
              >
                → {link.label}
              </Link>
            ))}
          </div>

          {/* Categories */}
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '10px', fontSize: '14px' }}>Categories</h4>
            {['Dog Medicines', 'Cat Medicines', 'Bird Medicines', 'Parasite Treatment', 'Deworming', 'Supplements', 'Pet Food', 'Pain Relief & Symptomatic Care', 'Skin & External Care', 'Equipment & Devices', 'Accessories'].map((cat) => (
              <Link key={cat} href={`/shop?category=${encodeURIComponent(cat)}`} style={{ display: 'block', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', marginBottom: '6px', fontSize: '13px' }}
                onMouseEnter={e => e.target.style.opacity = '1'}
                onMouseLeave={e => e.target.style.opacity = '0.8'}
              >
                → {cat}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '10px', fontSize: '14px' }}>Contact Us</h4>
            <div style={{ fontSize: '13px', lineHeight: '1.8', opacity: 0.85 }}>
              <p>📍 Rawalpindi, Punjab, Pakistan</p>
              <p>📞 0300-1234567</p>
              <p>✉️ info@furrandfeathers.com</p>
              <p style={{ marginTop: '8px', fontWeight: '600' }}>Payment Methods:</p>
              <p>💵 Cash on Delivery</p>
              <p>📱 Easypaisa / JazzCash</p>
              <p>🏦 Bank Transfer</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <p style={{ fontSize: '12px', opacity: 0.7 }}>© 2024 Furr & Feather's Hospital. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Privacy Policy', 'Returns & Refunds', 'Shipping Policy'].map((item) => (
              <Link key={item} href="/" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '12px' }}>{item}</Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          [data-footer-grid] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          [data-footer-grid] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}