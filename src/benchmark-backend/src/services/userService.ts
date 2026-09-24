import bcrypt from 'bcryptjs';
import { db } from '../db/client';
import { AppError } from '../errors';
import type { AuthUser } from './authService';
import type { PatchMeBody } from '../schemas/userSchema';

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

export function updateUser(userId: string, body: PatchMeBody): AuthUser {
  return db.transaction(() => {
    const row = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(userId) as UserRow | undefined;

    if (!row) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    if (body.newPassword !== undefined) {
      if (!body.currentPassword || !bcrypt.compareSync(body.currentPassword, row.password)) {
        throw new AppError('Current password is incorrect', 400, 'BAD_REQUEST');
      }
    }

    if (body.email !== undefined && body.email !== row.email) {
      const existing = db
        .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
        .get(body.email, userId);
      if (existing) {
        throw new AppError('Email already registered', 409, 'CONFLICT');
      }
    }

    if (body.username !== undefined && body.username !== row.username) {
      const existing = db
        .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
        .get(body.username, userId);
      if (existing) {
        throw new AppError('Username already taken', 409, 'CONFLICT');
      }
    }

    const newEmail = body.email ?? row.email;
    const newUsername = body.username ?? row.username;
    const newPassword =
      body.newPassword !== undefined
        ? bcrypt.hashSync(body.newPassword, 10)
        : row.password;

    db.prepare(
      'UPDATE users SET email = ?, username = ?, password = ? WHERE id = ?',
    ).run(newEmail, newUsername, newPassword, userId);

    const updated = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(userId) as UserRow;

    return rowToUser(updated);
  })();
}
