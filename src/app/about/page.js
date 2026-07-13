'use client';
import { FiAward, FiUsers, FiTruck, FiHeart } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '24px 20px', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '1.7rem', fontWeight: '800', marginBottom: '6px' }}>About Furr & Feather's Hospital</h1>
          <p style={{ opacity: 0.85, fontSize: '13px', maxWidth: '600px', margin: '0 auto' }}>
            Pakistan's trusted destination for genuine veterinary medicines and pet care products
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: '50px 20px' }}>
        {/* Story Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', marginBottom: '60px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '18px' }}>Our Story</h2>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text)', marginBottom: '16px' }}>
              Furr & Feather's Hospital was founded with a simple mission — to make genuine, high-quality veterinary medicines and pet care products accessible to every pet owner in Pakistan.
            </p>
            <p style={{ fontSize: '15px', lineHeight: '1.8', color: 'var(--text)' }}>
              As a team led by a qualified veterinary doctor, we understand the importance of authentic products and proper guidance when it comes to your pet's health. We've built this platform to bridge the gap between trusted veterinary care and everyday pet owners across the country.
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', fontSize: '140px' }}>
            🏥
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '60px' }}>
          {[
            { icon: <FiAward size={32} />, number: '100%', label: 'Genuine Products' },
            { icon: <FiUsers size={32} />, number: '5000+', label: 'Happy Customers' },
            { icon: <FiTruck size={32} />, number: '50+', label: 'Cities Covered' },
            { icon: <FiHeart size={32} />, number: '300+', label: 'Products Available' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: 'white', borderRadius: '14px', padding: '28px', textAlign: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <div style={{ color: 'var(--primary)', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>{stat.icon}</div>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px' }}>{stat.number}</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '60px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>🎯</div>
            <h3 style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)', marginBottom: '12px' }}>Our Mission</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
              To provide every pet owner in Pakistan with easy access to genuine veterinary medicines, expert-recommended supplements, and reliable pet care products — backed by fast delivery and trustworthy service.
            </p>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '14px', padding: '32px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '36px', marginBottom: '16px' }}>🌟</div>
            <h3 style={{ fontWeight: '700', fontSize: '18px', color: 'var(--primary)', marginBottom: '12px' }}>Our Vision</h3>
            <p style={{ fontSize: '14px', lineHeight: '1.7', color: 'var(--text-muted)' }}>
              To become Pakistan's most trusted online veterinary platform, raising awareness about proper pet healthcare and making quality pet care a standard, not a luxury.
            </p>
          </div>
        </div>

        {/* Why Trust Us */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '32px' }}>Why Pet Owners Trust Us</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { icon: '✅', title: '100% Authentic', desc: 'Sourced directly from authorized distributors' },
              { icon: '👨‍⚕️', title: 'Vet Led', desc: 'Founded and guided by a certified veterinarian' },
              { icon: '🚚', title: 'Pakistan-Wide Delivery', desc: 'We deliver to every major city' },
              { icon: '💵', title: 'Cash on Delivery', desc: 'Shop with confidence, pay on arrival' },
            ].map((item, i) => (
              <div key={i} style={{ padding: '24px 18px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '36px', marginBottom: '12px' }}>{item.icon}</div>
                <h4 style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text)', marginBottom: '8px' }}>{item.title}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}