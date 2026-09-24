import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { AppError, AuthError } from '../errors/index';

interface UserRow {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

export interface UserResult {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface AuthResult {
  user: UserResult;
  token: string;
}

function signToken(userId: string, email: string, username: string): string {
  return jwt.sign(
    { userId, email, username },
    process.env.JWT_SECRET as string,
    { expiresIn: '24h' },
  );
}

export function registerUser(email: string, username: string, password: string): AuthResult {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const id = randomUUID();

  try {
    db.prepare(
      'INSERT INTO users (id, email, username, password, created_at) VALUES (?, ?, ?, ?, datetime(\'now\'))',
    ).run(id, email, username, hashedPassword);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('UNIQUE constraint failed')) {
      if (message.includes('users.email')) {
        throw new AppError('Email already registered', 409, 'CONFLICT');
      }
      if (message.includes('users.username')) {
        throw new AppError('Username already taken', 409, 'CONFLICT');
      }
    }
    throw err;
  }

  const row = db.prepare<[string], UserRow>('SELECT * FROM users WHERE id = ?').get(id)!;
  const token = signToken(id, email, username);

  return {
    user: { id: row.id, email: row.email, username: row.username, createdAt: row.created_at },
    token,
  };
}

export function loginUser(email: string, password: string): AuthResult {
  const row = db.prepare<[string], UserRow>('SELECT * FROM users WHERE email = ?').get(email);

  if (!row) {
    throw new AuthError('Invalid credentials');
  }

  const match = bcrypt.compareSync(password, row.password);
  if (!match) {
    throw new AuthError('Invalid credentials');
  }

  const token = signToken(row.id, row.email, row.username);

  return {
    user: { id: row.id, email: row.email, username: row.username, createdAt: row.created_at },
    token,
  };
}

export function getUserById(userId: string): UserResult | null {
  const row = db.prepare<[string], UserRow>('SELECT * FROM users WHERE id = ?').get(userId);
  if (!row) return null;
  return { id: row.id, email: row.email, username: row.username, createdAt: row.created_at };
}
