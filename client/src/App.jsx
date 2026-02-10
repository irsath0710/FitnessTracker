/**
 * ============================================
 * MAIN APP COMPONENT
 * ============================================
 * 
 * 📚 LEARNING NOTES:
 * 
 * REACT ROUTER:
 * React Router enables navigation between pages without full page reloads.
 * - BrowserRouter: Uses HTML5 history API for clean URLs
 * - Routes: Container for Route components
 * - Route: Maps a URL path to a component
 * 
 * PROTECTED ROUTES:
 * Some pages should only be accessible to logged-in users.
 * We create a ProtectedRoute component that redirects to login if not auth'd.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoadingScreen } from './components/ui';
import ErrorBoundary from './components/ErrorBoundary';

// Pages (lazy loaded for better performance)
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Workout = React.lazy(() => import('./pages/Workout'));
const Nutrition = React.lazy(() => import('./pages/Nutrition'));
const Profile = React.lazy(() => import('./pages/Profile'));

/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication.
 * If user is not logged in, redirects to login page.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * PublicRoute Component
 * 
 * For login/register pages - redirects to dashboard if already logged in.
 */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * AppRoutes Component
 * 
 * Defines all the routes for the application.
 */
function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/workout"
        element={
          <ProtectedRoute>
            <Workout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/nutrition"
        element={
          <ProtectedRoute>
            <Nutrition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

/**
 * Main App Component
 * 
 * Wrapped with ErrorBoundary to catch runtime errors gracefully.
 * Uses React.lazy + Suspense for code-splitting (smaller initial bundle).
 */
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <React.Suspense fallback={<LoadingScreen />}>
            <AppRoutes />
          </React.Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
