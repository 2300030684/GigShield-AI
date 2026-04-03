import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Button } from './Button';
import { ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '16px 40px',
      background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
      backdropFilter: scrolled ? 'blur(16px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.05)' : '1px solid transparent',
      boxShadow: scrolled ? 'var(--shadow-card)' : 'none',
      transition: 'all 0.3s ease',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img src="/favicon.svg" alt="Trustpay Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          fontSize: '24px',
          letterSpacing: '-0.5px',
          color: 'var(--text-primary)'
        }}>
          Trustpay<span style={{ color: 'var(--accent-cyan)' }}>.</span>
        </span>
      </Link>

      <nav style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
        {['Features', 'How It Works', 'Plans', 'For Insurers', 'Blog'].map(link => (
          <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} style={{
            fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 500, transition: 'color 0.2s ease'
          }} onMouseOver={e => e.target.style.color = 'var(--accent-cyan)'} onMouseOut={e => e.target.style.color = 'var(--text-secondary)'}>
            {link}
          </a>
        ))}
      </nav>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <Link to="/login">
          <Button variant="ghost">Login</Button>
        </Link>
        <Link to="/register">
          <Button variant="primary" glow>Register</Button>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
