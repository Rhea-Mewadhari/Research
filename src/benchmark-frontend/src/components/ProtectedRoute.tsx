import type { ReactElement, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props): ReactElement {
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children as ReactElement;
}
