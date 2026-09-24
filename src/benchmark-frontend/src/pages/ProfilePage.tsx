import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import type { User } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  if (!user) return null;

  const memberSinceYear = new Date(user.createdAt).getFullYear();

  function handleEditClick() {
    setOriginalUser({ ...user });
    setUsernameInput(user.username);
    setEmailInput(user.email);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordSection(false);
    setErrorMessage('');
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setErrorMessage('');
  }

  async function handleSave() {
    if (!originalUser) return;

    const patch: Record<string, string> = {};
    if (usernameInput !== originalUser.username) patch.username = usernameInput;
    if (emailInput !== originalUser.email) patch.email = emailInput;
    if (showPasswordSection && currentPassword !== '') {
      patch.currentPassword = currentPassword;
      patch.newPassword = newPassword;
    }

    if (Object.keys(patch).length === 0) {
      setIsEditing(false);
      return;
    }

    const response = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(patch),
    });

    const data = (await response.json()) as { user?: User; error?: string };

    if (response.ok && data.user) {
      updateUser(data.user);
      setIsEditing(false);
      setErrorMessage('');
    } else {
      setErrorMessage(data.error ?? 'An error occurred');
    }
  }

  if (isEditing) {
    return (
      <div>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="text"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
        </div>
        {showPasswordSection && (
          <div>
            <div>
              <label htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        )}
        {errorMessage && <div>{errorMessage}</div>}
        <button type="button" onClick={() => void handleSave()}>Save</button>
        <button type="button" onClick={handleCancel}>Cancel</button>
        <button type="button" onClick={() => setShowPasswordSection((prev) => !prev)}>
          Change password
        </button>
      </div>
    );
  }

  return (
    <div>
      <div>{user.username}</div>
      <div>{user.email}</div>
      <div>{memberSinceYear}</div>
      <button type="button" onClick={handleEditClick}>Edit Profile</button>
    </div>
  );
}
