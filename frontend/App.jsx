import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
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
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import InsuranceCatalog from "./pages/InsuranceCatalog";
import HowItWorksPage from "./pages/HowItWorksPage";
import StormSimulator from "./pages/StormSimulator";


import MobileNav from './components/MobileNav';
import { connectSocket } from './services/socket.js';
import { useAuthStore } from './store/authStore';

import ProtectedRoute from './components/ProtectedRoute';

// ── Route guard: redirect to /onboarding if user hasn't completed it yet
const OnboardingGuard = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  if (location.pathname === '/onboarding') return <Outlet />;
  if (user && user.isOnboardingComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
};

// ── Admin-only guard
const AdminRoute = () => {
  const { user, isAdmin } = useAuthStore();
  return isAdmin() ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

// ── Route guard: redirect to /dashboard if ALREADY logged in (for public pages)
const PublicRoute = () => {
  const { isLoggedIn } = useAuthStore();
  return isLoggedIn ? <Navigate to="/dashboard" replace /> : <Outlet />;
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
  const { isLoggedIn } = useAuthStore();

  // Init Socket.io once app mounts (if authenticated)
  useEffect(() => {
    if (isLoggedIn) {
      try {
        connectSocket();
      } catch (err) {
        console.warn('[Socket] Could not connect on startup:', err.message);
      }
    }
  }, [isLoggedIn]);

  return (
    <Router>
      <Routes>
        {/* Auth Routes - No Navbar */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login/callback" element={<AuthCallback />} />
        </Route>

        {/* Public Routes - With Navbar */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogPostPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/insurance-catalog" element={<InsuranceCatalog />} />
        </Route>

        {/* Protected Routes — Worker & Admin have access to main dashboard */}
        <Route element={<ProtectedRoute allowedRoles={['ROLE_WORKER', 'ROLE_ADMIN']}><Outlet /></ProtectedRoute>}>
          {/* Onboarding — must complete before accessing any other page */}
          <Route path="/onboarding" element={<OnboardingPage />} />

          {/* All other protected pages require onboarding to be complete */}
          <Route element={<OnboardingGuard />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"   element={<UserDashboard />} />
              <Route path="/plans"       element={<PlansPage />} />
              <Route path="/claim"       element={<ClaimHistory />} />
              <Route path="/claim-flow"  element={<ClaimFlow />} />
              <Route path="/insights"    element={<AIInsights />} />
              <Route path="/settings"    element={<SettingsProfile />} />
              <Route path="/blog-feed"   element={<BlogPage />} />
              <Route path="/catalog"     element={<InsuranceCatalog />} />

              {/* Admin-only pages — strictly restricted to ROLE_ADMIN */}
              <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']}><Outlet /></ProtectedRoute>}>
                <Route path="/admin"       element={<AdminDashboard />} />
                <Route path="/admin/fraud" element={<FraudMonitor />} />
                <Route path="/admin/simulate" element={<StormSimulator />} />
              </Route>

            </Route>
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
