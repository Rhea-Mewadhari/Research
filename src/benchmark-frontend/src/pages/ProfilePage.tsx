import { useState, type FormEvent } from 'react';
import { useAuthContext } from '../context/AuthContext';
import type { User } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthContext();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  function handleEditClick() {
    setUsername(user!.username);
    setEmail(user!.email);
    setShowPasswordFields(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const body: Record<string, string> = {};
    if (username !== user!.username) body.username = username;
    if (email !== user!.email) body.email = email;

    if (showPasswordFields && newPassword) {
      if (newPassword.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('Passwords do not match');
        return;
      }
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? 'An error occurred. Please try again.');
        return;
      }

      const data = (await res.json()) as { user: User };
      updateUser(data.user);
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container">
      <h1>Profile</h1>
      {!isEditing ? (
        <>
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}
          </p>
          <button onClick={handleEditClick}>Edit Profile</button>
        </>
      ) : (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
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
            <button type="button" onClick={() => setShowPasswordFields(!showPasswordFields)}>
              Change Password
            </button>
          </div>
          {showPasswordFields && (
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
                <label htmlFor="confirmNewPassword">Confirm New Password</label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
              </div>
            </>
          )}
          {error && <p role="alert">{error}</p>}
          <button type="submit" disabled={isLoading}>
            Save
          </button>
          <button type="button" onClick={handleCancel}>
            Cancel
          </button>
        </form>
      )}
    </main>
  );
}
