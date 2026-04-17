import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ShieldCheck, 
  Activity, 
  List, 
  User,
  LogOut,
  Settings,
  Shield,
  Zap,
} from 'lucide-react';

import { fetchUserData } from '../services/api';
import { useAuthStore } from '../store/authStore';

const Sidebar = () => {
  const [user, setUser] = useState(null);
  const { logout, isAdmin, user: authUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await fetchUserData();
        setUser(data);
      } catch (err) {
        // fallback to store user
        if (authUser) setUser(authUser);
      }
    };
    loadUser();
  }, [authUser]);

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Policy', path: '/plans', icon: ShieldCheck },
    { label: 'Catalog', path: '/catalog', icon: List },
    { label: 'AI', path: '/insights', icon: Activity },
    { label: 'Claims', path: '/claim', icon: List },
    { label: 'Blog', path: '/blog-feed', icon: List },
    { label: 'Profile', path: '/settings', icon: User },
  ];

  const adminItems = [
    { label: 'Admin', path: '/admin', icon: Shield },
    { label: 'Simulate Storm', path: '/admin/simulate', icon: Zap },
  ];


  const displayUser = user || authUser;

  return (
    <aside className="sidebar-desktop" style={{
      width: '240px',
      borderRight: '1px solid var(--border)',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 0'
    }}>
      <div style={{ padding: '0 24px', marginBottom: '40px' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <img src="/favicon.svg" alt="Trustpay Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <span style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: '22px',
            letterSpacing: '-0.5px',
            color: 'var(--text-primary)'
          }}>
            Trustpay
          </span>
        </Link>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              textDecoration: 'none',
              fontWeight: 500,
              borderLeft: '3px solid transparent'
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} color={isActive ? 'var(--accent-cyan)' : 'currentColor'} />
                <span style={{ color: isActive ? 'var(--text-primary)' : 'inherit' }}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Admin section — shown only for ROLE_ADMIN users */}
        {isAdmin() && (
          <>
            <div style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '1px',
              color: 'var(--text-muted)',
              padding: '16px 24px 4px',
              textTransform: 'uppercase'
            }}>
              Admin
            </div>
            {adminItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 24px',
                  color: 'var(--accent-orange)',
                  transition: 'all 0.2s ease',
                  textDecoration: 'none',
                  fontWeight: 500,
                  borderLeft: '3px solid transparent'
                }}
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={20} color={isActive ? 'var(--accent-orange)' : 'currentColor'} />
                    <span style={{ color: isActive ? 'var(--text-primary)' : 'inherit' }}>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {displayUser && (
        <div style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              background: isAdmin() ? 'rgba(245,158,11,0.15)' : 'var(--accent-cyan-dim)', 
              color: isAdmin() ? 'var(--accent-orange)' : 'var(--accent-cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '14px',
              border: isAdmin() ? '1px solid rgba(245,158,11,0.3)' : 'none'
            }}>
              {displayUser.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'TP'}
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayUser.name || displayUser.username || 'User'}
              </div>
              <div className="badge" style={{
                fontSize: '9px',
                padding: '2px 8px',
                marginTop: '4px',
                background: isAdmin() ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.1)',
                color: isAdmin() ? 'var(--accent-orange)' : 'var(--accent-green)',
                border: `1px solid ${isAdmin() ? 'rgba(245,158,11,0.3)' : 'rgba(34,197,94,0.2)'}`,
                borderRadius: '4px',
                display: 'inline-block',
              }}>
                {isAdmin() ? '⚡ Admin' : 'Standard Plan'}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(220, 38, 38, 0.05)',
              color: 'var(--accent-red)',
              border: '1px solid rgba(220, 38, 38, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(220, 38, 38, 0.05)';
            }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
      
      <style>{`
        .sidebar-link:hover {
          background: var(--bg-card-hover);
          color: var(--text-primary) !important;
        }
        .sidebar-link.active {
          border-left-color: var(--accent-cyan) !important;
          background: linear-gradient(90deg, var(--accent-cyan-dim) 0%, transparent 100%);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
