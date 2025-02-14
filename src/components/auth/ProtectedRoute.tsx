import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { auth } = useUser();
  const location = useLocation();

  useEffect(() => {
    // If user is not authenticated, save the attempted route

    console.log("auth",auth,"location",location)
    if (!auth.isAuthenticated) {
      localStorage.setItem('intendedRoute', location.pathname + location.search);
    }
  }, [auth.isAuthenticated, location]);

  if (!auth.isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};