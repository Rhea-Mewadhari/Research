import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  id?: string;
  email: string;
  username: string;
  createdAt: string;
}

export class AuthApiError extends Error {
  status: number;
  serverMessage?: string;
  details?: Array<{ field: string; message: string }>;

  constructor(
    status: number,
    serverMessage?: string,
    details?: Array<{ field: string; message: string }>,
  ) {
    super(serverMessage ?? 'Auth error');
    this.name = 'AuthApiError';
    this.status = status;
    this.serverMessage = serverMessage;
    this.details = details;
  }
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

const BASE_URL = 'http://localhost:3001';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('auth_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

  const isAuthenticated = token !== null;

  async function login(email: string, password: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      throw new AuthApiError(res.status, body.error);
    }

    const data = (await res.json()) as { user: User; token: string };
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  async function register(email: string, username: string, password: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });

    if (!res.ok) {
      const body = (await res.json()) as {
        error?: string;
        details?: Array<{ field: string; message: string }>;
      };
      throw new AuthApiError(res.status, body.error, body.details);
    }

    const data = (await res.json()) as { user: User; token: string };
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  }

  function logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setToken(null);
    setUser(null);
  }

  function updateUser(user: User): void {
    setUser(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
