import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { AppError, AuthError } from '../errors';

const JWT_SECRET = process.env.JWT_SECRET ?? 'default-dev-secret';

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

export async function register(
  email: string,
  username: string,
  password: string,
): Promise<{ user: SafeUser; token: string }> {
  const existingEmail = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
  if (existingEmail) {
    throw new AppError('Email already registered', 409, 'CONFLICT');
  }

  const existingUsername = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username);
  if (existingUsername) {
    throw new AppError('Username already taken', 409, 'CONFLICT');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const id = randomUUID();

  db.prepare('INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)').run(
    id,
    email,
    username,
    hashedPassword,
  );

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
  const user = rowToSafeUser(row);
  const token = jwt.sign({ userId: user.id, email: user.email, username: user.username }, JWT_SECRET, {
    expiresIn: '24h',
  });

  return { user, token };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: SafeUser; token: string }> {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;

  if (!row || !(await bcrypt.compare(password, row.password))) {
    throw new AuthError('Invalid credentials');
  }

  const user = rowToSafeUser(row);
  const token = jwt.sign({ userId: user.id, email: user.email, username: user.username }, JWT_SECRET, {
    expiresIn: '24h',
  });

  return { user, token };
}

export function getById(userId: string): SafeUser {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;

  if (!row) {
    throw new AuthError('User not found');
  }

  return rowToSafeUser(row);
}
