import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface AuthUser {
  id?: string;
  email: string;
  username: string;
  createdAt?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  register: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function toSafeUser(user: AuthUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: user.createdAt,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const isAuthenticated = token !== null;

  const login = useCallback((newToken: string, newUser: AuthUser) => {
    const safeUser = toSafeUser(newUser);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(safeUser));
    setToken(newToken);
    setUser(safeUser);
  }, []);

  const register = useCallback((newToken: string, newUser: AuthUser) => {
    const safeUser = toSafeUser(newUser);
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(safeUser));
    setToken(newToken);
    setUser(safeUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback((newUser: AuthUser) => {
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
