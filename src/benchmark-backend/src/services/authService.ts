import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { AppError, AuthError } from '../errors';

const BCRYPT_ROUNDS = 10;

export interface UserPublic {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

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

function signToken(userId: string, email: string, username: string): string {
  const secret = process.env.JWT_SECRET ?? 'dev-secret';
  return jwt.sign({ userId, email, username }, secret, { expiresIn: '24h' });
}

export async function register(
  email: string,
  username: string,
  password: string,
): Promise<{ user: UserPublic; token: string }> {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const id = randomUUID();

  try {
    db.prepare(
      'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)',
    ).run(id, email, username, passwordHash);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('UNIQUE constraint failed: users.email')) {
      throw new AppError('Email already registered', 409, 'CONFLICT');
    }
    if (msg.includes('UNIQUE constraint failed: users.username')) {
      throw new AppError('Username already taken', 409, 'CONFLICT');
    }
    throw err;
  }

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
  const user = rowToPublic(row);
  const token = signToken(user.id, user.email, user.username);
  return { user, token };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: UserPublic; token: string }> {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;

  if (!row) {
    throw new AuthError('Invalid credentials');
  }

  const match = await bcrypt.compare(password, row.password);
  if (!match) {
    throw new AuthError('Invalid credentials');
  }

  const user = rowToPublic(row);
  const token = signToken(user.id, user.email, user.username);
  return { user, token };
}

export function getById(id: string): UserPublic | null {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  return row ? rowToPublic(row) : null;
}
