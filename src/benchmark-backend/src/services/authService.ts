import { randomUUID } from 'node:crypto';
import { hash, compare } from 'bcryptjs';
import { db } from '../db/client';
import { createJwt, verifyJwt } from '../utils/jwt';
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

export interface AuthResult {
  user: UserResponse;
  token: string;
}

function toUserResponse(row: UserRow): UserResponse {
  return { id: row.id, email: row.email, username: row.username, createdAt: row.created_at };
}

export async function registerUser(
  email: string,
  username: string,
  password: string,
): Promise<AuthResult> {
  const emailExists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (emailExists) {
    throw new AppError('Email already registered', 409, 'EMAIL_CONFLICT');
  }

  const usernameExists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (usernameExists) {
    throw new AppError('Username already taken', 409, 'USERNAME_CONFLICT');
  }

  const hashedPassword = await hash(password, 10);
  const id = randomUUID();

  db.prepare('INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)').run(
    id,
    email,
    username,
    hashedPassword,
  );

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
  const user = toUserResponse(row);
  const token = createJwt({ userId: id, email, username });

  return { user, token };
}

export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;

  if (!row || !(await compare(password, row.password))) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const user = toUserResponse(row);
  const token = createJwt({ userId: row.id, email: row.email, username: row.username });

  return { user, token };
}

export function getUserById(userId: string): UserResponse | null {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
  if (!row) return null;
  return toUserResponse(row);
}

export function getUserFromToken(token: string): UserResponse | null {
  const payload = verifyJwt(token);
  if (!payload) return null;

  const row = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(payload.userId) as UserRow | undefined;
  if (!row) return null;

  return toUserResponse(row);
}
