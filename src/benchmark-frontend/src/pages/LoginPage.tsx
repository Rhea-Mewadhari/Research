import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext, AuthError } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof AuthError && err.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={isLoading}>
          Log In
        </button>
      </form>
    </main>
  );
}
