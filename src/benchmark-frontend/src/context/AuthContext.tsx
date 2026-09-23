import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  username: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const BASE_URL = 'http://localhost:3001';

function readStoredAuth(): { user: User | null; token: string | null } {
  try {
    const token = localStorage.getItem('auth_token');
    const raw = localStorage.getItem('auth_user');
    const user = raw ? (JSON.parse(raw) as User) : null;
    return { token, user };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [{ user, token }, setAuth] = useState<{ user: User | null; token: string | null }>(
    readStoredAuth,
  );

  const isAuthenticated = token !== null && user !== null;

  async function login(email: string, password: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { user: { username: string; email: string }; token: string };
    if (!res.ok) throw new Error('Invalid email or password');
    const storedUser: User = { username: data.user.username, email: data.user.email };
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(storedUser));
    setAuth({ user: storedUser, token: data.token });
  }

  async function register(email: string, username: string, password: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    const data = (await res.json()) as {
      user?: { username: string; email: string };
      token?: string;
      error?: string;
      details?: Array<{ field: string; message: string }>;
    };
    if (!res.ok) {
      if (res.status === 400 && data.details && data.details.length > 0) {
        throw new Error(data.details[0].message);
      }
      throw new Error(data.error ?? 'Registration failed');
    }
    const storedUser: User = {
      username: data.user!.username,
      email: data.user!.email,
    };
    localStorage.setItem('auth_token', data.token!);
    localStorage.setItem('auth_user', JSON.stringify(storedUser));
    setAuth({ user: storedUser, token: data.token! });
  }

  function logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setAuth({ user: null, token: null });
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
