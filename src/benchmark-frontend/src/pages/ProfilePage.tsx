import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3001';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthContext();

  const [isEditMode, setIsEditMode] = useState(false);
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [isPasswordSectionOpen, setIsPasswordSectionOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  function openEditForm(): void {
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setErrorMessage('');
    setIsPasswordSectionOpen(false);
    setIsEditMode(true);
  }

  function handleCancel(): void {
    setUsername(user?.username ?? '');
    setEmail(user?.email ?? '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setErrorMessage('');
    setIsPasswordSectionOpen(false);
    setIsEditMode(false);
  }

  async function handleSave(): Promise<void> {
    setErrorMessage('');

    if (isPasswordSectionOpen && newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters.');
      return;
    }

    if (isPasswordSectionOpen && newPassword !== confirmNewPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    const patchBody: Record<string, string> = {};

    if (username !== (user?.username ?? '')) {
      patchBody.username = username;
    }
    if (email !== (user?.email ?? '')) {
      patchBody.email = email;
    }
    if (isPasswordSectionOpen && currentPassword) {
      patchBody.currentPassword = currentPassword;
      patchBody.newPassword = newPassword;
    }

    if (Object.keys(patchBody).length === 0) {
      return;
    }

    const res = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(patchBody),
    });

    const data = (await res.json()) as {
      user?: { id: string; email: string; username: string; createdAt: string };
      error?: string;
    };

    if (res.ok && data.user) {
      updateUser(data.user);
      setIsEditMode(false);
    } else {
      setErrorMessage(data.error ?? 'An error occurred.');
    }
  }

  if (!user) {
    return <div />;
  }

  const memberSinceYear = new Date(user.createdAt).getFullYear();

  if (!isEditMode) {
    return (
      <main>
        <h1>Profile</h1>
        <p>{user.username}</p>
        <p>{user.email}</p>
        <p>{memberSinceYear}</p>
        <button type="button" onClick={openEditForm}>
          Edit Profile
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Profile</h1>
      {errorMessage && <p>{errorMessage}</p>}
      <div>
        <label htmlFor="username-input">Username</label>
        <input
          id="username-input"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="email-input">Email</label>
        <input
          id="email-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <button type="button" onClick={() => setIsPasswordSectionOpen((prev) => !prev)}>
        Change Password
      </button>
      {isPasswordSectionOpen && (
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
      <button type="button" onClick={() => void handleSave()}>
        Save
      </button>
      <button type="button" onClick={handleCancel}>
        Cancel
      </button>
    </main>
  );
}
