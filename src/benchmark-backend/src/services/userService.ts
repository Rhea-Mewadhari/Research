import bcrypt from 'bcrypt';
import { db } from '../db/client';
import { AppError } from '../errors';

type UserRow = {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
};

type SafeUser = {
  id: string;
  email: string;
  username: string;
  createdAt: string;
};

function rowToSafeUser(row: UserRow): SafeUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
  };
}

type UpdateUserInput = {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
};

export async function updateUser(userId: string, input: UpdateUserInput): Promise<SafeUser> {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
  if (!row) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  // Verify current password before allowing password change
  if (input.newPassword !== undefined) {
    const passwordCorrect = await bcrypt.compare(input.currentPassword ?? '', row.password);
    if (!passwordCorrect) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_PASSWORD');
    }
  }

  // Check uniqueness constraints against other users
  if (input.email !== undefined && input.email !== row.email) {
    const existing = db.prepare('SELECT 1 FROM users WHERE email = ? AND id != ?').get(input.email, userId);
    if (existing) {
      throw new AppError('Email already registered', 409, 'CONFLICT');
    }
  }

  if (input.username !== undefined && input.username !== row.username) {
    const existing = db.prepare('SELECT 1 FROM users WHERE username = ? AND id != ?').get(input.username, userId);
    if (existing) {
      throw new AppError('Username already taken', 409, 'CONFLICT');
    }
  }

  // Build atomic update
  const setClauses: string[] = [];
  const params: unknown[] = [];

  if (input.email !== undefined) {
    setClauses.push('email = ?');
    params.push(input.email);
  }

  if (input.username !== undefined) {
    setClauses.push('username = ?');
    params.push(input.username);
  }

  if (input.newPassword !== undefined) {
    const hashed = await bcrypt.hash(input.newPassword, 10);
    setClauses.push('password = ?');
    params.push(hashed);
  }

  if (setClauses.length > 0) {
    params.push(userId);
    db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);
  }

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow;
  return rowToSafeUser(updated);
}
