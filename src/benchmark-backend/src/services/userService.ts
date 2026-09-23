import bcrypt from 'bcrypt';
import { db } from '../db/client';
import { ConflictError, ValidationError } from '../errors';

interface UserRow {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

interface UserResponse {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

function toUserResponse(row: UserRow): UserResponse {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
  };
}

export async function updateUser(
  userId: string,
  data: { username?: string; email?: string; currentPassword?: string; newPassword?: string }
): Promise<UserResponse> {
  if (data.newPassword) {
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
    // schema guarantees currentPassword is present when newPassword is
    const match = await bcrypt.compare(data.currentPassword!, row!.password);
    if (!match) {
      throw new ValidationError('Current password is incorrect');
    }
  }

  if (data.email) {
    const conflict = db
      .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
      .get(data.email, userId) as { id: string } | undefined;
    if (conflict) {
      throw new ConflictError('Email already taken');
    }
  }

  if (data.username) {
    const conflict = db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .get(data.username, userId) as { id: string } | undefined;
    if (conflict) {
      throw new ConflictError('Username already taken');
    }
  }

  const setClauses: string[] = [];
  const params: (string | number)[] = [];

  if (data.email) {
    setClauses.push('email = ?');
    params.push(data.email);
  }
  if (data.username) {
    setClauses.push('username = ?');
    params.push(data.username);
  }
  const BCRYPT_ROUNDS = process.env['NODE_ENV'] === 'test' ? 1 : 10;

  if (data.newPassword) {
    const hash = await bcrypt.hash(data.newPassword, BCRYPT_ROUNDS);
    setClauses.push('password = ?');
    params.push(hash);
  }

  params.push(userId);
  db.prepare(`UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`).run(...params);

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow;
  return toUserResponse(updated);
}
