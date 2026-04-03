import { useState, useCallback } from 'react';

// Simple UI store shim for toasts
export const useUIStore = () => {
  const showToast = useCallback((type, message) => {
    console.log(`[TOAST] ${type}: ${message}`);
    // Show console toast for now, can be replaced by real UI logic later
  }, []);

  return { showToast };
};
