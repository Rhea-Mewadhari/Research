import bcrypt from 'bcrypt';
import { db } from '../db/client';
import { AppError } from '../errors';
import type { UserPublic } from './authService';

const BCRYPT_ROUNDS = 10;

interface UserRow {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

function rowToPublic(row: UserRow): UserPublic {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
  };
}

export async function updateUser(
  userId: string,
  updates: {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  },
): Promise<UserPublic> {
  const current = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
  if (!current) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  if (updates.newPassword !== undefined) {
    const match = await bcrypt.compare(updates.currentPassword ?? '', current.password);
    if (!match) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }
  }

  if (updates.email !== undefined && updates.email !== current.email) {
    const conflict = db
      .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
      .get(updates.email, userId);
    if (conflict) {
      throw new AppError('Email already registered', 409, 'CONFLICT');
    }
  }

  if (updates.username !== undefined && updates.username !== current.username) {
    const conflict = db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .get(updates.username, userId);
    if (conflict) {
      throw new AppError('Username already taken', 409, 'CONFLICT');
    }
  }

  const setClauses: string[] = [];
  const params: unknown[] = [];

  if (updates.email !== undefined) {
    setClauses.push('email = ?');
    params.push(updates.email);
  }
  if (updates.username !== undefined) {
    setClauses.push('username = ?');
    params.push(updates.username);
  }
  if (updates.newPassword !== undefined) {
    const hash = await bcrypt.hash(updates.newPassword, BCRYPT_ROUNDS);
    setClauses.push('password = ?');
    params.push(hash);
  }

  params.push(userId);
  db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow;
  return rowToPublic(updated);
}
