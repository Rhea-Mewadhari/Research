import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3001';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  function openEdit() {
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPassword(false);
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function handleSave() {
    if (!user) return;

    const changes: Record<string, string> = {};
    if (username !== user.username) changes.username = username;
    if (email !== user.email) changes.email = email;
    if (showPassword && currentPassword) {
      changes.currentPassword = currentPassword;
      changes.newPassword = newPassword;
      changes.confirmNewPassword = confirmNewPassword;
    }

    if (Object.keys(changes).length === 0) {
      setEditing(false);
      return;
    }

    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(changes),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong');
      return;
    }

    updateUser(data.user);
    setEditing(false);
    setError(null);
  }

  if (!user) return null;

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      <h1>Profile</h1>

      {!editing ? (
        <div>
          <p>{user.username}</p>
          <p>{user.email}</p>
          <p>{memberSince}</p>
          <button onClick={openEdit}>Edit Profile</button>
        </div>
      ) : (
        <div>
          {error && <p role="alert">{error}</p>}

          <div>
            <label htmlFor="profile-username">Username</label>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="profile-email">Email</label>
            <input
              id="profile-email"
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

          <button type="button" onClick={handleSave}>
            Save
          </button>
          <button type="button" onClick={cancelEdit}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
