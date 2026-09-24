import { useState } from 'react';
import { type User, useAuthContext } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3001';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  function openEdit() {
    setUsername(user!.username);
    setEmail(user!.email);
    setShowPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    const body: Record<string, string> = {};
    if (username !== user!.username) body.username = username;
    if (email !== user!.email) body.email = email;
    if (currentPassword) body.currentPassword = currentPassword;
    if (newPassword) body.newPassword = newPassword;
    if (confirmNewPassword) body.confirmNewPassword = confirmNewPassword;

    if (Object.keys(body).length === 0) {
      setEditing(false);
      return;
    }

    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json()) as { user?: User; error?: string };

    if (res.ok && data.user) {
      updateUser(data.user);
      setEditing(false);
    } else {
      setError(data.error ?? 'An error occurred');
    }
  }

  if (!editing) {
    return (
      <div>
        <p>{user.username}</p>
        <p>{user.email}</p>
        <p>{user.createdAt}</p>
        <button onClick={openEdit}>Edit Profile</button>
      </div>
    );
  }

  return (
    <div>
      {error && <p>{error}</p>}
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      {!showPassword && (
        <button onClick={() => setShowPassword(true)}>Change Password</button>
      )}
      {showPassword && (
        <div>
          <div>
            <label htmlFor="current-password">Current Password</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="new-password">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password">Confirm New Password</label>
            <input
              id="confirm-new-password"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
        </div>
      )}
      <button onClick={handleSave}>Save</button>
      <button onClick={cancelEdit}>Cancel</button>
    </div>
  );
}
