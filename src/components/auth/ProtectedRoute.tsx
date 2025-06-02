import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { auth, loading } = useUser();
  const location = useLocation();

  useEffect(() => {
    // If user is not authenticated and not loading, save the attempted route
    if (!auth.isAuthenticated && !loading) {
      localStorage.setItem('intendedRoute', location.pathname + location.search);
    }
  }, [auth.isAuthenticated, loading, location]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to signin if not authenticated
  if (!auth.isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};