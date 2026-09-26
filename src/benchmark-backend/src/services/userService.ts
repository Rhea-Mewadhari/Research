import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import { AppError } from '../errors';
import type { AuthUser } from './authService';

interface UserRow {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

function rowToUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
  };
}

export interface UpdateUserFields {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export function updateUser(userId: string, fields: UpdateUserFields): AuthUser {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
  if (!row) throw new AppError('User not found', 404, 'NOT_FOUND');

  if (fields.newPassword !== undefined) {
    if (!fields.currentPassword || !bcrypt.compareSync(fields.currentPassword, row.password)) {
      throw new AppError('Current password is incorrect', 400, 'BAD_REQUEST');
    }
  }

  if (fields.email !== undefined && fields.email !== row.email) {
    const taken = db.prepare('SELECT 1 FROM users WHERE email = ? AND id != ?').get(fields.email, userId);
    if (taken) throw new AppError('Email already taken', 409, 'CONFLICT');
  }

  if (fields.username !== undefined && fields.username !== row.username) {
    const taken = db.prepare('SELECT 1 FROM users WHERE username = ? AND id != ?').get(fields.username, userId);
    if (taken) throw new AppError('Username already taken', 409, 'CONFLICT');
  }

  const setClauses: string[] = [];
  const params: unknown[] = [];

  if (fields.email !== undefined) {
    setClauses.push('email = ?');
    params.push(fields.email);
  }
  if (fields.username !== undefined) {
    setClauses.push('username = ?');
    params.push(fields.username);
  }
  if (fields.newPassword !== undefined) {
    setClauses.push('password = ?');
    params.push(bcrypt.hashSync(fields.newPassword, 10));
  }

  if (setClauses.length > 0) {
    params.push(userId);
    db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
  }

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow;
  return rowToUser(updated);
}
