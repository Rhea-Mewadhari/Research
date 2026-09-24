import bcrypt from 'bcrypt';
import { db } from '../db/client';
import { AppError } from '../errors';
import type { UpdateUserInput } from '../schemas/userSchema';

interface UserRow {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

function toPublicUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
  };
}

export async function updateUser(userId: string, data: UpdateUserInput) {
  if (data.newPassword !== undefined) {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
    if (!row) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    const match = await bcrypt.compare(data.currentPassword!, row.password);
    if (!match) {
      throw new AppError('Current password is incorrect', 400, 'BAD_REQUEST');
    }
  }

  if (data.email !== undefined) {
    const existing = db
      .prepare('SELECT 1 FROM users WHERE email = ? AND id != ?')
      .get(data.email, userId);
    if (existing) {
      throw new AppError('Email already in use', 409, 'CONFLICT');
    }
  }

  if (data.username !== undefined) {
    const existing = db
      .prepare('SELECT 1 FROM users WHERE username = ? AND id != ?')
      .get(data.username, userId);
    if (existing) {
      throw new AppError('Username already in use', 409, 'CONFLICT');
    }
  }

  let passwordHash: string | undefined;
  if (data.newPassword !== undefined) {
    passwordHash = await bcrypt.hash(data.newPassword, 10);
  }

  const setClauses: string[] = [];
  const values: string[] = [];

  if (data.username !== undefined) {
    setClauses.push('username = ?');
    values.push(data.username);
  }
  if (data.email !== undefined) {
    setClauses.push('email = ?');
    values.push(data.email);
  }
  if (passwordHash !== undefined) {
    setClauses.push('password = ?');
    values.push(passwordHash);
  }

  if (setClauses.length > 0) {
    values.push(userId);
    db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
  }

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow;
  return toPublicUser(updated);
}
