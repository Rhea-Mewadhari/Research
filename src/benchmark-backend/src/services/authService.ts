import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { AuthError } from '../errors';

const SALT_ROUNDS = 10;

interface UserRow {
  id: string;
  email: string;
  username: string;
  password: string;
  created_at: string;
}

interface UserResult {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthResult {
  user: UserResult;
  token: string;
}

function rowToUser(row: UserRow): UserResult {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
  };
}

function signToken(userId: string, email: string, username: string): string {
  return jwt.sign({ userId, email, username }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}

export async function register(email: string, username: string, password: string): Promise<AuthResult> {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)'
  ).run(id, email, username, hashedPassword);
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
  const user = rowToUser(row);
  const token = signToken(user.id, user.email, user.username);
  return { user, token };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as UserRow | undefined;
  if (!row) {
    throw new AuthError('Invalid credentials');
  }
  const valid = await bcrypt.compare(password, row.password);
  if (!valid) {
    throw new AuthError('Invalid credentials');
  }
  const user = rowToUser(row);
  const token = signToken(user.id, user.email, user.username);
  return { user, token };
}

export function getById(id: string): UserResult | undefined {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
  if (!row) return undefined;
  return rowToUser(row);
}
