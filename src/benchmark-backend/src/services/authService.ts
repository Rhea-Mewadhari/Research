import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../db/client';
import { AuthError, ConflictError } from '../errors';

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

interface AuthResult {
  user: UserResponse;
  token: string;
}

function signToken(userId: string, email: string, username: string): string {
  return jwt.sign(
    { userId, email, username },
    process.env['JWT_SECRET'] as string,
    { expiresIn: '24h' }
  );
}

function toUserResponse(row: UserRow): UserResponse {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    createdAt: row.created_at,
  };
}

export function register(email: string, username: string, password: string): AuthResult {
  const existingEmail = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(email) as { id: string } | undefined;
  if (existingEmail) {
    throw new ConflictError('Email already registered');
  }

  const existingUsername = db
    .prepare('SELECT id FROM users WHERE username = ?')
    .get(username) as { id: string } | undefined;
  if (existingUsername) {
    throw new ConflictError('Username already taken');
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const id = crypto.randomUUID();
  db.prepare(
    'INSERT INTO users (id, email, username, password) VALUES (?, ?, ?, ?)'
  ).run(id, email, username, passwordHash);

  const row = db
    .prepare('SELECT * FROM users WHERE id = ?')
    .get(id) as UserRow;

  const token = signToken(id, email, username);
  return { user: toUserResponse(row), token };
}

export function login(email: string, password: string): AuthResult {
  const row = db
    .prepare('SELECT * FROM users WHERE email = ?')
    .get(email) as UserRow | undefined;

  if (!row || !bcrypt.compareSync(password, row.password)) {
    throw new AuthError('Invalid credentials');
  }

  const token = signToken(row.id, row.email, row.username);
  return { user: toUserResponse(row), token };
}

export function getById(userId: string): UserResponse {
  const row = db
    .prepare('SELECT id, email, username, created_at FROM users WHERE id = ?')
    .get(userId) as UserRow | undefined;

  if (!row) {
    throw new AuthError('Unauthorized');
  }

  return toUserResponse(row);
}
