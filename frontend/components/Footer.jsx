import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';


const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', padding: '48px 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '24px', color: 'var(--text-primary)' }}>
              <Shield size={24} color="var(--accent-cyan)" />
              <span>Trustpay<span style={{ color: 'var(--accent-cyan)' }}>.</span></span>
            </Link>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Protecting delivery workers from income loss during weather disruptions and local disturbances.
            </p>
          </div>

          <div>
            <span style={{ fontWeight: 700, fontSize: '14px', marginBottom: '24px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Product</span>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/#features" className="hover-cyan" style={{ fontSize: '14px', color: 'var(--text-muted)', transition: 'color 0.2s ease' }}>Features</Link>
              <Link to="/how-it-works" className="hover-cyan" style={{ fontSize: '14px', color: 'var(--text-muted)', transition: 'color 0.2s ease' }}>How it works</Link>
              <Link to="/plans" className="hover-cyan" style={{ fontSize: '14px', color: 'var(--text-muted)', transition: 'color 0.2s ease' }}>Pricing</Link>
            </nav>
          </div>

          <div>
            <span style={{ fontWeight: 700, fontSize: '14px', marginBottom: '24px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Company</span>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/about" className="hover-cyan" style={{ fontSize: '14px', color: 'var(--text-muted)', transition: 'color 0.2s ease' }}>About us</Link>
              <Link to="/blog" className="hover-cyan" style={{ fontSize: '14px', color: 'var(--text-muted)', transition: 'color 0.2s ease' }}>Blog</Link>
              <Link to="/contact" className="hover-cyan" style={{ fontSize: '14px', color: 'var(--text-muted)', transition: 'color 0.2s ease' }}>Contact</Link>
            </nav>
          </div>

          <div>
            <span style={{ fontWeight: 700, fontSize: '14px', marginBottom: '24px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Legal</span>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/privacy" className="hover-cyan" style={{ fontSize: '14px', color: 'var(--text-muted)', transition: 'color 0.2s ease' }}>Privacy policy</Link>
              <Link to="/terms" className="hover-cyan" style={{ fontSize: '14px', color: 'var(--text-muted)', transition: 'color 0.2s ease' }}>Terms of service</Link>
            </nav>
          </div>
        </div>

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Trustpay. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover-cyan" style={{ fontSize: '12px', color: 'var(--text-muted)', transition: 'color 0.2s ease', textDecoration: 'none' }}>
              FB
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover-cyan" style={{ fontSize: '12px', color: 'var(--text-muted)', transition: 'color 0.2s ease', textDecoration: 'none' }}>
              TW
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover-cyan" style={{ fontSize: '12px', color: 'var(--text-muted)', transition: 'color 0.2s ease', textDecoration: 'none' }}>
              LI
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover-cyan" style={{ fontSize: '12px', color: 'var(--text-muted)', transition: 'color 0.2s ease', textDecoration: 'none' }}>
              IG
            </a>

          </div>
        </div>
      </div>
      <style>{`
        .hover-cyan:hover { color: var(--accent-cyan) !important; text-decoration: none; }
      `}</style>
    </footer>
  );
};

export default Footer;
