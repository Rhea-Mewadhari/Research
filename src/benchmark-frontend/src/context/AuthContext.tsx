import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  register: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readLocalUser(): User | null {
  try {
    const raw = localStorage.getItem('auth_user');
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readLocalUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

  function login(newUser: User, newToken: string) {
    localStorage.setItem('auth_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setUser(newUser);
    setToken(newToken);
  }

  function register(newUser: User, newToken: string) {
    login(newUser, newToken);
  }

  function logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setToken(null);
  }

  function updateUser(updatedUser: User) {
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
