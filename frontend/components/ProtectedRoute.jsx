import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute
 * Guards routes by checking for 'token' and 'role' in localStorage.
 * Supports role-based access control via 'allowedRoles' prop.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // If no token exists, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user has a token but not the required role, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
