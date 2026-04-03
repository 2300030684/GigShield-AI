import { useState, useCallback, useEffect } from 'react';

// ── MOCK DATABASE HELPERS ──
const USERS_KEY = 'tp_registered_users';

const getRegisteredUsers = () => {
  const saved = localStorage.getItem(USERS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const registerUser = (userData) => {
  const users = getRegisteredUsers();
  // Check if already registered
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
    const saved = localStorage.getItem('tp_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('trustpay_token'));

  const login = useCallback((userData, userToken) => {
    // Ensure onboarding status is trackable
    const userWithStatus = { ...userData, isOnboardingComplete: userData.isOnboardingComplete || false };
    localStorage.setItem('tp_user', JSON.stringify(userWithStatus));
    localStorage.setItem('trustpay_token', userToken);
    setUser(userWithStatus);
    setToken(userToken);
  }, []);

  const completeOnboarding = useCallback(() => {
    if (!user) return;
    const updatedUser = { ...user, isOnboardingComplete: true };
    localStorage.setItem('tp_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Also update in the mock DB
    const users = getRegisteredUsers();
    const index = users.findIndex(u => u.identifier === user.email);
    if (index !== -1) {
      users[index].isOnboardingComplete = true;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  }, [user]);

  const logout = useCallback(() => {
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

  return {
    isLoggedIn: !!token,
    user,
    token,
    login,
    logout,
    hasPlan,
    completeOnboarding,
  };
};
