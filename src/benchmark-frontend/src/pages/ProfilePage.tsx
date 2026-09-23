import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3001';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function openEditForm() {
    setUsernameInput(user?.username ?? '');
    setEmailInput(user?.email ?? '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPasswordSection(false);
    setErrorMessage('');
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setShowPasswordSection(false);
    setErrorMessage('');
  }

  async function handleSave() {
    if (!user) return;

    const diff: Record<string, string> = {};
    if (usernameInput !== user.username) diff.username = usernameInput;
    if (emailInput !== user.email) diff.email = emailInput;
    if (showPasswordSection && currentPassword) {
      diff.currentPassword = currentPassword;
      diff.newPassword = newPassword;
      diff.confirmNewPassword = confirmNewPassword;
    }

    if (Object.keys(diff).length === 0) {
      setIsEditing(false);
      return;
    }

    const res = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(diff),
    });

    const data = (await res.json()) as { user?: { id: string; username: string; email: string; createdAt: string }; error?: string };

    if (res.ok && data.user) {
      updateUser(data.user);
      setIsEditing(false);
      setShowPasswordSection(false);
      setErrorMessage('');
    } else {
      setErrorMessage(data.error ?? 'An error occurred');
    }
  }

  if (!user) return null;

  if (!isEditing) {
    return (
      <div>
        <p>{user.username}</p>
        <p>{user.email}</p>
        <p>{user.createdAt}</p>
        <button onClick={openEditForm}>Edit Profile</button>
      </div>
    );
  }

  return (
    <div>
      <div>
        <label htmlFor="username-input">Username</label>
        <input
          id="username-input"
          type="text"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email-input">Email</label>
        <input
          id="email-input"
          type="email"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
        />
      </div>

      {!showPasswordSection && (
        <button onClick={() => setShowPasswordSection(true)}>Change Password</button>
      )}

      {showPasswordSection && (
        <div>
          <div>
            <label htmlFor="current-password-input">Current Password</label>
            <input
              id="current-password-input"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="new-password-input">New Password</label>
            <input
              id="new-password-input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirm-new-password-input">Confirm New Password</label>
            <input
              id="confirm-new-password-input"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
        </div>
      )}

      {errorMessage && <p>{errorMessage}</p>}

      <button onClick={handleSave}>Save</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
}
