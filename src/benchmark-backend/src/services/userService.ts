import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import { AppError } from '../errors';
import type { User } from './authService';

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: String(row['id']),
    email: String(row['email']),
    username: String(row['username']),
    createdAt: String(row['created_at']),
  };
}

export function updateUser(
  userId: string,
  data: {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }
): User {
  const row = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(userId) as Record<string, unknown> | undefined;

  if (!row) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  if (data.newPassword !== undefined) {
    if (!bcrypt.compareSync(data.currentPassword!, String(row['password']))) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }
  }

  const sets: string[] = [];
  const params: unknown[] = [];

  if (data.username !== undefined) {
    sets.push('username = ?');
    params.push(data.username);
  }
  if (data.email !== undefined) {
    sets.push('email = ?');
    params.push(data.email);
  }
  if (data.newPassword !== undefined) {
    sets.push('password = ?');
    params.push(bcrypt.hashSync(data.newPassword, 10));
  }

  params.push(userId);

  try {
    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).run(...params);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('users.email')) {
      throw new AppError('Email already taken', 409, 'CONFLICT');
    }
    if (msg.includes('users.username')) {
      throw new AppError('Username already taken', 409, 'CONFLICT');
    }
    throw err;
  }

  const updated = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(userId) as Record<string, unknown>;

  return rowToUser(updated);
}
