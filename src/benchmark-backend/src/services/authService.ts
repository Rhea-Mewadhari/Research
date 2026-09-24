import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { AppError, AuthError } from '../errors';

export interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

function rowToUser(row: Record<string, unknown>): User {
  return {
    id: String(row['id']),
    email: String(row['email']),
    username: String(row['username']),
    createdAt: String(row['created_at']),
  };
}

function signToken(user: User): string {
  const secret = process.env['JWT_SECRET'] ?? 'dev-secret';
  return jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    secret,
    { expiresIn: '24h' }
  );
}

export function register(data: {
  email: string;
  username: string;
  password: string;
}): { user: User; token: string } {
  const hashed = bcrypt.hashSync(data.password, 10);
  const id = randomUUID();

  try {
    db.prepare(
      'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)'
    ).run(id, data.email, data.username, hashed);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('users.email')) {
      throw new AppError('Email already registered', 409, 'CONFLICT');
    }
    if (msg.includes('users.username')) {
      throw new AppError('Username already taken', 409, 'CONFLICT');
    }
    throw err;
  }

  const row = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(id) as Record<string, unknown>;

  const user = rowToUser(row);
  return { user, token: signToken(user) };
}

export function login(
  email: string,
  password: string
): { user: User; token: string } {
  const row = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email) as Record<string, unknown> | undefined;

  if (!row || !bcrypt.compareSync(password, String(row['password']))) {
    throw new AuthError('Invalid credentials');
  }

  const user = rowToUser(row);
  return { user, token: signToken(user) };
}

export function getById(id: string): User | null {
  const row = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined;
  return row ? rowToUser(row) : null;
}
