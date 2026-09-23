import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from 'react';

const BASE_URL = 'http://localhost:3001';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useLayoutEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch {
        // malformed JSON — treat as logged-out user
      }
    }
  }, []);

  async function login(email: string, password: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      throw Object.assign(new Error(data.error ?? 'Login failed'), { status: res.status });
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
      const data = (await res.json()) as { error?: string; details?: Array<{ field: string; message: string }> };
      const err = new Error(data.error ?? 'Registration failed') as Error & {
        status: number;
        details?: Array<{ field: string; message: string }>;
      };
      err.status = res.status;
      err.details = data.details;
      throw err;
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

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: token !== null, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
