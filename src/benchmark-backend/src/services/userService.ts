import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import { ValidationError, ConflictError } from '../errors';

const SALT_ROUNDS = 10;

interface UserRow {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

interface UserResult {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface UpdatePayload {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export async function updateUser(userId: string, payload: UpdatePayload): Promise<UserResult> {
  const { username, email, currentPassword, newPassword } = payload;

  if (newPassword !== undefined) {
    const row = db.prepare('SELECT password FROM users WHERE id = ?').get(userId) as
      | { password: string }
      | undefined;
    if (!row) throw new ValidationError('User not found');
    const valid = await bcrypt.compare(currentPassword!, row.password);
    if (!valid) throw new ValidationError('Current password is incorrect');
  }

  if (email !== undefined) {
    const existing = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, userId);
    if (existing) throw new ConflictError('Email already registered');
  }

  if (username !== undefined) {
    const existing = db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .get(username, userId);
    if (existing) throw new ConflictError('Username already taken');
  }

  const setClauses: string[] = [];
  const values: string[] = [];

  if (username !== undefined) {
    setClauses.push('username = ?');
    values.push(username);
  }
  if (email !== undefined) {
    setClauses.push('email = ?');
    values.push(email);
  }
  if (newPassword !== undefined) {
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    setClauses.push('password = ?');
    values.push(hashedPassword);
  }

  if (setClauses.length > 0) {
    values.push(userId);
    db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
  }

  const row = db
    .prepare('SELECT id, email, username, created_at FROM users WHERE id = ?')
    .get(userId) as UserRow | undefined;
  if (!row) throw new ValidationError('User not found');

  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
  };
}
