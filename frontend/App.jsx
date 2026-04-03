import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import UserDashboard from './pages/UserDashboard';
import PlansPage from './pages/PlansPage';
import ClaimHistory from './pages/ClaimHistory';
import AIInsights from './pages/AIInsights';
import SettingsProfile from './pages/SettingsProfile';
import ClaimFlow from "./pages/ClaimFlow";
import AdminDashboard from "./pages/AdminDashboard";
import FraudMonitor from "./pages/FraudMonitor";
import AuthCallback from "./pages/AuthCallback";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";

import MobileNav from './components/MobileNav';
import api from './services/api.js';
import { connectSocket } from './services/socket.js';

// ── Route guard: redirect to /auth if no JWT token
const PrivateRoute = () => {
  return api.isAuthenticated() ? <Outlet /> : <Navigate to="/login" replace />;
};

// ── Route guard: redirect to /dashboard if ALREADY has JWT token (for public pages)
const PublicRoute = () => {
  return api.isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Outlet />;
};

// Layouts
const PublicLayout = () => (
  <div className="min-h-screen">
    <Navbar />
    <Outlet />
  </div>
);

const AppLayout = () => (
  <div className="app-layout" style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
    <Sidebar />
    <main style={{ flex: 1, padding: '24px', overflowY: 'auto', background: 'var(--bg-primary)' }}>
      <Outlet />
    </main>
    <MobileNav />
  </div>
);

function App() {
  // Init Socket.io once app mounts (if authenticated)
  useEffect(() => {
    if (api.isAuthenticated()) {
      try {
        connectSocket();
      } catch (err) {
        console.warn('[Socket] Could not connect on startup:', err.message);
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        {/* Auth Route - No Navbar */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login/callback" element={<AuthCallback />} />
        </Route>

        {/* Public Routes - With Navbar */}
        <Route element={<PublicRoute />}>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>
        </Route>

        {/* Protected Dashboard Routes */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard"   element={<UserDashboard />} />
            <Route path="/plans"       element={<PlansPage />} />
            <Route path="/claim"       element={<ClaimHistory />} />
            <Route path="/claim-flow"  element={<ClaimFlow />} />
            <Route path="/insights"    element={<AIInsights />} />
            <Route path="/settings"    element={<SettingsProfile />} />
            <Route path="/admin"       element={<AdminDashboard />} />
            <Route path="/admin/fraud" element={<FraudMonitor />} />
          </Route>
          
          {/* Onboarding uses its own custom layout */}
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
