import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext, AuthApiError } from '../context/AuthContext';

export default function SignupPage() {
  const { register } = useAuthContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    setFieldErrors([]);

    try {
      await register(email, username, password);
      navigate('/');
    } catch (err) {
      if (err instanceof AuthApiError) {
        if (err.status === 409) {
          setError(err.serverMessage ?? 'Email already registered');
        } else if (err.status === 400 && err.details) {
          setFieldErrors(err.details.map((d) => d.message));
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-testid="signup-page">
      <form onSubmit={handleSubmit}>
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="signup-confirm-password">Confirm Password</label>
        <input
          id="signup-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p>{error}</p>}
        {fieldErrors.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
        <button type="submit" disabled={loading}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
