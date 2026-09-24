import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { AppError, AuthError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-key';

interface UserRow {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

function toPublicUser(row: UserRow) {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
  };
}

export async function register(email: string, username: string, password: string) {
  const id = randomUUID();
  const hash = await bcrypt.hash(password, 10);

  try {
    db.prepare(
      'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)'
    ).run(id, email, username, hash);
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes('users.email')) {
        throw new AppError('Email already registered', 409, 'CONFLICT');
      }
      if (err.message.includes('users.username')) {
        throw new AppError('Username already taken', 409, 'CONFLICT');
      }
    }
    throw err;
  }

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
  const user = toPublicUser(row);
  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { user, token };
}

export async function login(email: string, password: string) {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;

  if (!row) {
    throw new AuthError('Invalid credentials');
  }

  const match = await bcrypt.compare(password, row.password);
  if (!match) {
    throw new AuthError('Invalid credentials');
  }

  const user = toPublicUser(row);
  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { user, token };
}

export function getById(id: string) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  if (!row) return null;
  return toPublicUser(row);
}
