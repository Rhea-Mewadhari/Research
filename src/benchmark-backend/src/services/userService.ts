import { hash, compare } from 'bcryptjs';
import { db } from '../db/client';
import { AppError } from '../errors';

interface UserRow {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface UpdateUserInput {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

function toUserResponse(row: UserRow): UserResponse {
  return { id: row.id, email: row.email, username: row.username, createdAt: row.created_at };
}

export async function updateUser(userId: string, updates: UpdateUserInput): Promise<UserResponse> {
  const currentRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as
    | UserRow
    | undefined;
  if (!currentRow) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  if (updates.currentPassword !== undefined) {
    const passwordMatch = await compare(updates.currentPassword, currentRow.password);
    if (!passwordMatch) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }
  }

  if (updates.email !== undefined && updates.email !== currentRow.email) {
    const emailConflict = db
      .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
      .get(updates.email, userId);
    if (emailConflict) {
      throw new AppError('Email already registered', 409, 'EMAIL_CONFLICT');
    }
  }

  if (updates.username !== undefined && updates.username !== currentRow.username) {
    const usernameConflict = db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .get(updates.username, userId);
    if (usernameConflict) {
      throw new AppError('Username already taken', 409, 'USERNAME_CONFLICT');
    }
  }

  let newPasswordHash: string | undefined;
  if (updates.newPassword !== undefined) {
    newPasswordHash = await hash(updates.newPassword, 10);
  }

  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (updates.email !== undefined) {
    setClauses.push('email = ?');
    values.push(updates.email);
  }
  if (updates.username !== undefined) {
    setClauses.push('username = ?');
    values.push(updates.username);
  }
  if (newPasswordHash !== undefined) {
    setClauses.push('password = ?');
    values.push(newPasswordHash);
  }

  if (setClauses.length > 0) {
    values.push(userId);
    db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
  }

  const updatedRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow;
  return toUserResponse(updatedRow);
}
