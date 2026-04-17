import { useState, useCallback } from 'react';

// ── MOCK DATABASE HELPERS ──
const USERS_KEY = 'tp_registered_users';

const getRegisteredUsers = () => {
  const saved = localStorage.getItem(USERS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const registerUser = (userData) => {
  const users = getRegisteredUsers();
  if (!users.find(u => u.identifier === userData.identifier)) {
    users.push(userData);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const findUser = (identifier) => {
  const users = getRegisteredUsers();
  return users.find(u => u.identifier === identifier);
};

export const updatePassword = (identifier, newPassword) => {
  const users = getRegisteredUsers();
  const index = users.findIndex(u => u.identifier === identifier);
  if (index !== -1) {
    users[index].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  }
  return false;
};

// ── MAIN AUTH STORE ──
export const useAuthStore = () => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('tp_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('trustpay_token'));

  const login = useCallback((userData, userToken) => {
    // Normalize and persist all user fields including role and onboarding status
    const userWithStatus = {
      ...userData,
      isOnboardingComplete: userData.isOnboardingComplete === true,
      role: userData.role || 'ROLE_WORKER',
    };
    localStorage.setItem('tp_user', JSON.stringify(userWithStatus));
    localStorage.setItem('trustpay_token', userToken);
    setUser(userWithStatus);
    setToken(userToken);
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser(prev => {
      if (!prev) return prev;
      const updatedUser = { ...prev, isOnboardingComplete: true };
      localStorage.setItem('tp_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const logout = useCallback(async () => {
    // Try to call backend logout
    try {
      const token = localStorage.getItem('trustpay_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (_) { /* ignore */ }
    
    localStorage.removeItem('tp_user');
    localStorage.removeItem('trustpay_token');
    localStorage.removeItem('auth_user'); 
    sessionStorage.clear();
    setUser(null);
    setToken(null);
  }, []);

  const hasPlan = useCallback(() => {
    return user?.activePlan && user?.activePlan !== 'none';
  }, [user]);

  const isAdmin = useCallback(() => {
    return user?.role === 'ROLE_ADMIN';
  }, [user]);

  return {
    isLoggedIn: !!token,
    user,
    token,
    login,
    logout,
    hasPlan,
    isAdmin,
    completeOnboarding,
  };
};
