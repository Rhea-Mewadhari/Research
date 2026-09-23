import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function SignupPage() {
  const { register } = useAuthContext();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);

    if (password !== confirmPassword) {
      setErrors(["Passwords do not match"]);
      return;
    }

    setLoading(true);
    try {
      await register(email, username, password);
      navigate('/');
    } catch (err) {
      const typedErr = err as { status?: number; message?: string; details?: Array<{ field: string; message: string }> };
      if (typedErr.status === 400 && typedErr.details) {
        setErrors(typedErr.details.map((d) => d.message));
      } else if (typedErr.status === 409) {
        setErrors([typedErr.message ?? 'Conflict']);
      } else {
        setErrors([typedErr.message ?? 'Registration failed']);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-testid="signup-page">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signup-email">Email</label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="signup-username">Username</label>
          <input
            id="signup-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label htmlFor="signup-confirm-password">Confirm Password</label>
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        {errors.length > 0 && (
          <ul role="alert">
            {errors.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        )}
        <button type="submit" disabled={loading}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
