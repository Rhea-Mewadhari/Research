import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/client';
import { AppError } from '../errors';

export interface AuthUser {
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

function rowToUser(row: UserRow): AuthUser {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
  };
}

function signToken(user: AuthUser): string {
  const secret = process.env['JWT_SECRET'] ?? 'dev-secret';
  return jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    secret,
    { expiresIn: '24h' },
  );
}

export function register(
  email: string,
  username: string,
  password: string,
): { user: AuthUser; token: string } {
  const hash = bcrypt.hashSync(password, 10);
  const id = uuidv4();

  try {
    db.prepare(
      'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)',
    ).run(id, email, username, hash);
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
  const user = rowToUser(row);
  return { user, token: signToken(user) };
}

export function login(
  email: string,
  password: string,
): { user: AuthUser; token: string } {
  const row = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email) as UserRow | undefined;

  if (!row || !bcrypt.compareSync(password, row.password)) {
    throw new AppError('Invalid credentials', 401, 'AUTH_ERROR');
  }

  const user = rowToUser(row);
  return { user, token: signToken(user) };
}

export function getById(userId: string): AuthUser | null {
  const row = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(userId) as UserRow | undefined;
  return row ? rowToUser(row) : null;
}
