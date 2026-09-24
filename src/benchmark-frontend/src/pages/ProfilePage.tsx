import { useState, type FormEvent } from 'react';
import { useAuthContext } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3001';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function openEdit() {
    if (!user) return;
    setUsername(user.username);
    setEmail(user.email);
    setShowPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError(null);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);

    const changes: Record<string, string> = {};
    if (username !== user.username) changes.username = username;
    if (email !== user.email) changes.email = email;
    if (showPassword && currentPassword && newPassword) {
      changes.currentPassword = currentPassword;
      changes.newPassword = newPassword;
    }

    if (Object.keys(changes).length === 0) {
      setEditing(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(changes),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong');
        return;
      }

      const data = await res.json();
      updateUser(data.user);
      setEditing(false);
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  if (!editing) {
    return (
      <div>
        <p>{user.username}</p>
        <p>{user.email}</p>
        <p>{new Date(user.createdAt).toLocaleDateString()}</p>
        <button type="button" onClick={openEdit}>
          Edit Profile
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
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
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {!showPassword && (
        <button type="button" onClick={() => setShowPassword(true)}>
          Change Password
        </button>
      )}
      {showPassword && (
        <>
          <div>
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </>
      )}
      {error && <p>{error}</p>}
      <button type="submit" disabled={loading}>
        Save
      </button>
      <button type="button" onClick={cancel}>
        Cancel
      </button>
    </form>
  );
}
