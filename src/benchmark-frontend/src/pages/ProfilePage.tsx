import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3001';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthContext();

  const [isEditing, setIsEditing] = useState(false);
  const [usernameField, setUsernameField] = useState('');
  const [emailField, setEmailField] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [newPasswordError, setNewPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordFieldError, setPasswordFieldError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!user) return null;

  const openEditForm = () => {
    setUsernameField(user.username);
    setEmailField(user.email);
    setShowChangePassword(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setNewPasswordError(null);
    setConfirmPasswordError(null);
    setServerError(null);
    setPasswordFieldError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowChangePassword(false);
    setNewPasswordError(null);
    setConfirmPasswordError(null);
    setServerError(null);
    setPasswordFieldError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    let newPwdErr: string | null = null;
    let confirmPwdErr: string | null = null;

    if (showChangePassword && newPassword) {
      if (newPassword.length < 8) {
        newPwdErr = 'Password must be at least 8 characters';
      }
      if (newPassword !== confirmPassword) {
        confirmPwdErr = "Passwords don't match";
      }
    }

    setNewPasswordError(newPwdErr);
    setConfirmPasswordError(confirmPwdErr);

    if (newPwdErr || confirmPwdErr) return;

    const body: Record<string, string> = {};
    if (usernameField !== user.username) body.username = usernameField;
    if (emailField !== user.email) body.email = emailField;
    if (showChangePassword && currentPassword && newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    if (Object.keys(body).length === 0) {
      setIsEditing(false);
      return;
    }

    setServerError(null);
    setPasswordFieldError(null);

    const res = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      updateUser(data.user);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
    } else if (res.status === 409) {
      setServerError(data.error ?? 'Conflict');
    } else if (res.status === 400) {
      setPasswordFieldError(data.error ?? 'Bad request');
    }
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString();

  if (!isEditing) {
    return (
      <main>
        <h1>Profile</h1>
        <p>{user.username}</p>
        <p>{user.email}</p>
        <p>{memberSince}</p>
        {successMessage && <p>{successMessage}</p>}
        <button onClick={openEditForm}>Edit Profile</button>
      </main>
    );
  }

  return (
    <main>
      <h1>Profile</h1>
      <form onSubmit={handleSave}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={usernameField}
            onChange={(e) => setUsernameField(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={emailField}
            onChange={(e) => setEmailField(e.target.value)}
          />
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowChangePassword(!showChangePassword)}
          >
            Change Password
          </button>
          {showChangePassword && (
            <div>
              <div>
                <label htmlFor="currentPassword">Current password</label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                {passwordFieldError && <p>{passwordFieldError}</p>}
              </div>
              <div>
                <label htmlFor="newPassword">New password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {newPasswordError && <p>{newPasswordError}</p>}
              </div>
              <div>
                <label htmlFor="confirmPassword">Confirm new password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPasswordError && <p>{confirmPasswordError}</p>}
              </div>
            </div>
          )}
        </div>
        {serverError && <p>{serverError}</p>}
        <button type="submit">Save</button>
        <button type="button" onClick={cancelEdit}>
          Cancel
        </button>
      </form>
    </main>
  );
}
