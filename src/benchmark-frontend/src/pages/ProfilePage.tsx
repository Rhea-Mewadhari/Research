import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const openEditForm = useCallback(() => {
    if (!user) return;
    setUsername(user.username);
    setEmail(user.email);
    setShowPassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setIsEditing(true);
  }, [user]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setError(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!user) return;
    const diff: Record<string, string> = {};
    if (username !== user.username) diff.username = username;
    if (email !== user.email) diff.email = email;
    if (currentPassword && newPassword) {
      diff.currentPassword = currentPassword;
      diff.newPassword = newPassword;
    }
    if (Object.keys(diff).length === 0) return;

    const res = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(diff),
    });

    const json = await res.json();

    if (res.ok) {
      updateUser(json.user);
      setIsEditing(false);
    } else {
      setError(json.error as string);
    }
  }, [user, token, username, email, currentPassword, newPassword, updateUser]);

  if (!user) return null;

  const year = user.createdAt ? user.createdAt.slice(0, 4) : '';

  if (!isEditing) {
    return (
      <div>
        <p>{user.username}</p>
        <p>{user.email}</p>
        <p>{year}</p>
        <button onClick={openEditForm}>Edit Profile</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <label htmlFor="profile-username">Username</label>
        <input
          id="profile-username"
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="profile-email">Email</label>
        <input
          id="profile-email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
      </div>
      {!showPassword && (
        <button type="button" onClick={() => setShowPassword(true)}>Change password</button>
      )}
      {showPassword && (
        <div>
          <div>
            <label htmlFor="profile-current-password">Current password</label>
            <input
              id="profile-current-password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="profile-new-password">New password</label>
            <input
              id="profile-new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="profile-confirm-password">Confirm new password</label>
            <input
              id="profile-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      )}
      {error && <p>{error}</p>}
      <button type="button" onClick={handleSave}>Save</button>
      <button type="button" onClick={handleCancel}>Cancel</button>
    </div>
  );
}
