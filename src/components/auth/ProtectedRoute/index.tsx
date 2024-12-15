import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../../../contexts/UserContext';
import { ProtectedRouteProps } from './types';

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { auth } = useUser();
  const location = useLocation();

  if (!auth.isAuthenticated) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};