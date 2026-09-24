import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import type { User } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 401) {
        setError('Invalid email or password');
        return;
      }

      if (!res.ok) {
        setError('An error occurred. Please try again.');
        return;
      }

      const data = (await res.json()) as { user: User; token: string };
      login(data.user, data.token);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in…' : 'Log In'}
        </button>
      </form>
    </main>
  );
}
