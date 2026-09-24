import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import { AppError } from '../errors/index';
import type { UserResult } from './authService';

interface UserRow {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

export function updateUser(
  userId: string,
  data: { username?: string; email?: string; currentPassword?: string; newPassword?: string },
): UserResult {
  const row = db.prepare<[string], UserRow>('SELECT * FROM users WHERE id = ?').get(userId);
  if (!row) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  if (data.newPassword) {
    const match = bcrypt.compareSync(data.currentPassword!, row.password);
    if (!match) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }
  }

  if (data.email) {
    const conflict = db
      .prepare<[string, string], { id: string }>('SELECT id FROM users WHERE email = ? AND id != ?')
      .get(data.email, userId);
    if (conflict) {
      throw new AppError('Email already registered', 409, 'CONFLICT');
    }
  }

  if (data.username) {
    const conflict = db
      .prepare<[string, string], { id: string }>('SELECT id FROM users WHERE username = ? AND id != ?')
      .get(data.username, userId);
    if (conflict) {
      throw new AppError('Username already taken', 409, 'CONFLICT');
    }
  }

  db.prepare('UPDATE users SET email = ?, username = ?, password = ? WHERE id = ?').run(
    data.email ?? row.email,
    data.username ?? row.username,
    data.newPassword ? bcrypt.hashSync(data.newPassword, 10) : row.password,
    userId,
  );

  const updated = db.prepare<[string], UserRow>('SELECT * FROM users WHERE id = ?').get(userId)!;
  return {
    id: updated.id,
    email: updated.email,
    username: updated.username,
    createdAt: updated.created_at,
  };
}
