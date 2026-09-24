import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
