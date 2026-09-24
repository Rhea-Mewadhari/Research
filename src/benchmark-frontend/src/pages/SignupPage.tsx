import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setErrors(["Passwords do not match"]);
      return;
    }

    setErrors([]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json() as {
        token?: string;
        user?: { id?: string; email: string; username: string; createdAt?: string };
        error?: string;
        details?: Array<{ field: string; message: string }>;
      };

      if (res.status === 201 && data.token && data.user) {
        login(data.token, data.user);
        navigate('/');
      } else if (res.status === 409) {
        setErrors([data.error ?? 'Conflict']);
      } else if (res.status === 400) {
        if (data.details && data.details.length > 0) {
          setErrors(data.details.map((d) => d.message));
        } else {
          setErrors([data.error ?? 'Validation error']);
        }
      } else {
        setErrors([data.error ?? 'An error occurred']);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>Sign Up</h1>
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
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        <div>
          <label htmlFor="confirm-password">Confirm Password</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {errors.map((err, i) => (
          <p key={i} role="alert">{err}</p>
        ))}
        <button type="submit" disabled={isLoading}>
          Sign Up
        </button>
      </form>
    </main>
  );
}
