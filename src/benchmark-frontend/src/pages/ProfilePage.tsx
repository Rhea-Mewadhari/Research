import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';

const BASE_URL = 'http://localhost:3001';

export default function ProfilePage() {
  const { user, token, updateUser } = useAuthContext();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldError, setFieldError] = useState<{ field: string; message: string } | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  if (!user) return null;

  function startEdit() {
    setUsername(user!.username);
    setEmail(user!.email);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setShowPassword(false);
    setFieldError(null);
    setGeneralError(null);
    setSuccess(false);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setFieldError(null);
    setGeneralError(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setFieldError(null);
    setGeneralError(null);

    const body: Record<string, string> = {};
    if (username !== user!.username) body.username = username;
    if (email !== user!.email) body.email = email;
    if (newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    if (Object.keys(body).length === 0) {
      setEditing(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          const msg: string = data.error ?? 'Already taken';
          const field = msg.toLowerCase().includes('email') ? 'email' : 'username';
          setFieldError({ field, message: msg });
        } else if (res.status === 400) {
          setFieldError({ field: 'currentPassword', message: data.error ?? 'Bad request' });
        } else {
          setGeneralError(data.error ?? 'Update failed');
        }
        return;
      }
      updateUser(data.user);
      setSuccess(true);
      setEditing(false);
    } catch {
      setGeneralError('Update failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Profile</h1>
      {success && <p>Profile updated successfully.</p>}
      {!editing ? (
        <div>
          <p>Username: {user.username}</p>
          <p>Email: {user.email}</p>
          <p>Member since: {new Date(user.createdAt).toLocaleDateString()}</p>
          <button onClick={startEdit}>Edit Profile</button>
        </div>
      ) : (
        <form onSubmit={handleSave}>
          <div>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {fieldError?.field === 'username' && <p>{fieldError.message}</p>}
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {fieldError?.field === 'email' && <p>{fieldError.message}</p>}
          </div>
          <div>
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? 'Hide' : 'Change Password'}
            </button>
            {showPassword && (
              <div>
                <div>
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  {fieldError?.field === 'currentPassword' && <p>{fieldError.message}</p>}
                </div>
                <div>
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    id="newPassword"
                    type="password"
                    minLength={8}
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
              </div>
            )}
          </div>
          {generalError && <p>{generalError}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save'}
          </button>
          <button type="button" onClick={cancelEdit} disabled={loading}>
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
