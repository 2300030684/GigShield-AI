import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, ShieldCheck, Activity, List, User } from 'lucide-react';

const MobileNav = () => {
  const navItems = [
    { label: 'Home', path: '/dashboard', icon: Home },
    { label: 'Policy', path: '/plans', icon: ShieldCheck },
    { label: 'AI', path: '/insights', icon: Activity },
    { label: 'Claims', path: '/claim', icon: List },
    { label: 'Profile', path: '/settings', icon: User },
  ];

  return (
    <nav className="mobile-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.label}
          to={item.path}
          className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
        >
          <item.icon size={24} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileNav;
