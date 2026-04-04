import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ── GLOBAL AUTH CONTEXT ──
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Aliasing for backward compatibility if needed in existing files
export const useAuthStore = useAuth;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tp_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  
  const [token, setToken] = useState(() => localStorage.getItem('trustpay_token'));

  // Hydrate from localStorage on mount (redundant but safe)
  useEffect(() => {
    const savedToken = localStorage.getItem('trustpay_token');
    const savedUser = localStorage.getItem('tp_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch(e) {}
    }
  }, []);

  const login = useCallback((userData, userToken) => {
    const userWithStatus = { 
        ...userData, 
        isOnboardingComplete: userData.isOnboardingComplete === true || userData.onboardingComplete === true 
    };
    
    localStorage.setItem('tp_user', JSON.stringify(userWithStatus));
    localStorage.setItem('trustpay_token', userToken);
    
    // Some backend paths might use different keys
    localStorage.setItem('auth_user', JSON.stringify(userWithStatus)); 
    
    setUser(userWithStatus);
    setToken(userToken);
  }, []);

  const completeOnboarding = useCallback(() => {
    setUser(prev => {
      if (!prev) return null;
      const updatedUser = { ...prev, isOnboardingComplete: true };
      localStorage.setItem('tp_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tp_user');
    localStorage.removeItem('trustpay_token');
    localStorage.removeItem('auth_user'); 
    localStorage.removeItem('tp_registered_users'); // Clean up old mock data
    sessionStorage.clear();
    setUser(null);
    setToken(null);
  }, []);

  const hasPlan = useCallback(() => {
    return user?.activePlan && user?.activePlan !== 'none';
  }, [user]);

  const value = {
    isLoggedIn: !!token,
    user,
    token,
    login,
    logout,
    hasPlan,
    completeOnboarding,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
