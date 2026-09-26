import { Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import type { ReactNode } from 'react';

type Props = { children?: ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const { user } = useAuthContext();
  return user ? (children ?? <Outlet />) : <Navigate to="/login" replace />;
}
