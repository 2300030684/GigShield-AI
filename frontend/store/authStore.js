import { useState, useCallback, useEffect } from 'react';

// ── GLOBAL STATE SINGLETON ──
// This ensures all instances of the hook share the same data and sync across the app.
let globalState = {
  user: null,
  token: localStorage.getItem('trustpay_token'),
  listeners: new Set()
};

// Try to load initial user from storage
try {
  const saved = localStorage.getItem('tp_user');
  if (saved) globalState.user = JSON.parse(saved);
} catch (e) {}

const notifyListeners = () => {
  globalState.listeners.forEach(listener => listener({ ...globalState }));
};

const USERS_KEY = 'tp_registered_users';

export const registerUser = (userData) => {
  const saved = localStorage.getItem(USERS_KEY);
  const users = saved ? JSON.parse(saved) : [];
  if (!users.find(u => u.identifier === userData.identifier)) {
    users.push(userData);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const findUser = (identifier) => {
  const saved = localStorage.getItem(USERS_KEY);
  const users = saved ? JSON.parse(saved) : [];
  return users.find(u => u.identifier === identifier);
};

export const updatePassword = (identifier, newPassword) => {
  const saved = localStorage.getItem(USERS_KEY);
  const users = saved ? JSON.parse(saved) : [];
  const index = users.findIndex(u => u.identifier === identifier);
  if (index !== -1) {
    users[index].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  }
  return false;
};

export const useAuthStore = () => {
  const [state, setState] = useState({ user: globalState.user, token: globalState.token });

  useEffect(() => {
    const listener = (newState) => {
      setState({ user: newState.user, token: newState.token });
    };
    globalState.listeners.add(listener);
    // Sync state on mount
    if (state.token !== globalState.token || state.user !== globalState.user) {
        setState({ user: globalState.user, token: globalState.token });
    }
    return () => globalState.listeners.delete(listener);
  }, []);

  const login = useCallback((userData, userToken) => {
    const userWithStatus = {
      ...userData,
      isOnboardingComplete: userData.isOnboardingComplete === true,
      role: userData.role || 'ROLE_WORKER',
    };
    // Immediate sync to global state for route guards
    globalState.user = userWithStatus;
    globalState.token = userToken;
    
    // Persist
    localStorage.setItem('tp_user', JSON.stringify(userWithStatus));
    localStorage.setItem('trustpay_token', userToken);
    
    notifyListeners();
  }, []);

  const logout = useCallback(async () => {
    const token = globalState.token;
    
    localStorage.removeItem('tp_user');
    localStorage.removeItem('trustpay_token');
    localStorage.removeItem('auth_user'); 
    sessionStorage.clear();
    
    globalState.user = null;
    globalState.token = null;
    notifyListeners();

    try {
      if (token) {
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => {});
      }
    } catch (_) {}
  }, []);

  const completeOnboarding = useCallback(() => {
    if (!globalState.user) return;
    const updatedUser = { ...globalState.user, isOnboardingComplete: true };
    localStorage.setItem('tp_user', JSON.stringify(updatedUser));
    globalState.user = updatedUser;
    notifyListeners();
  }, []);

  return {
    isLoggedIn: !!state.token,
    user: state.user,
    token: state.token,
    login,
    logout,
    completeOnboarding,
    isAdmin: () => state.user?.role === 'ROLE_ADMIN',
    hasPlan: () => state.user?.activePlan && state.user?.activePlan !== 'none',
  };
};
