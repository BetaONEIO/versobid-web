import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'buyer' | 'seller' | 'admin';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const user = useAuthStore((state) => state.user);
  const userRole = useAuthStore((state) => state.user?.user_metadata.role);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}