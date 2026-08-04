import { vi } from 'vitest';

// This file issues many rapid requests across its test cases; the global
// rateLimiter middleware (shared in-memory store, same pattern as products.test.ts)
// would otherwise 429 later tests in the file. Auth-specific rate limiting is not
// part of this task's scope.
vi.mock('../../middleware/rateLimiter', () => ({
  rateLimiter: (_req: any, _res: any, next: any) => next(),
}));

import request from 'supertest';
import app from '../../app';
import { db } from '../../db/client';

// Products/rate-limiter tests exercise the benchmark auth scheme (requireAuth).
// These endpoints are new and unauthenticated by design (registration/login must
// work before a session exists), so no Authorization header is sent here.

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1] ?? '';
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}

describe('POST /api/auth/register', () => {
  it('registers a new user and returns 201 with a user object and token', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'jane.doe@example.com',
      username: 'jane_doe',
      password: 'supersecret123',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toMatchObject({
      email: 'jane.doe@example.com',
      username: 'jane_doe',
    });
    expect(res.body.user.id).toEqual(expect.any(String));
    expect(res.body.user.createdAt).toEqual(expect.any(String));
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('never includes the password anywhere in the response body', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'no-pw@example.com',
      username: 'no_pw_user',
      password: 'plaintext-secret',
    });

    expect(JSON.stringify(res.body)).not.toContain('plaintext-secret');
  });

  it('stores the password as a bcrypt hash, not plaintext', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'hash-check@example.com',
      username: 'hash_check_user',
      password: 'plaintext-secret',
    });

    const row = db
      .prepare('SELECT password FROM users WHERE email = ?')
      .get('hash-check@example.com') as { password: string } | undefined;

    expect(row).toBeDefined();
    expect(row!.password).not.toBe('plaintext-secret');
    expect(row!.password).toMatch(/^\$2[aby]?\$/);
  });

  it('issues a JWT carrying userId, email, and username claims', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'claims@example.com',
      username: 'claims_user',
      password: 'validpassword1',
    });

    expect(res.status).toBe(201);
    expect(res.body.token.split('.')).toHaveLength(3);

    const payload = decodeJwtPayload(res.body.token);
    expect(payload['userId']).toBe(res.body.user.id);
    expect(payload['email']).toBe('claims@example.com');
    expect(payload['username']).toBe('claims_user');
  });

  it('rejects a password shorter than 8 characters with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'short@example.com',
      username: 'short_user',
      password: 'short1',
    });

    expect(res.status).toBe(400);
  });

  it('rejects a missing password with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'missing-pw@example.com',
      username: 'missing_pw_user',
    });

    expect(res.status).toBe(400);
  });

  it('rejects an invalid email format with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      username: 'bad_email_user',
      password: 'validpassword1',
    });

    expect(res.status).toBe(400);
  });

  it('returns 409 "Email already registered" for a duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'dupe-email@example.com',
      username: 'dupe_email_a',
      password: 'validpassword1',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'dupe-email@example.com',
      username: 'dupe_email_b',
      password: 'validpassword1',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already registered');
  });

  it('returns 409 "Username already taken" for a duplicate username', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'dupe-username-a@example.com',
      username: 'dupe_username',
      password: 'validpassword1',
    });

    const res = await request(app).post('/api/auth/register').send({
      email: 'dupe-username-b@example.com',
      username: 'dupe_username',
      password: 'validpassword1',
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Username already taken');
  });
});

describe('POST /api/auth/login', () => {
  const LOGIN_USER = {
    email: 'login-user@example.com',
    username: 'login_user',
    password: 'loginpassword1',
  };

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(LOGIN_USER);
  });

  it('logs in with valid credentials and returns 200 with a user and token', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: LOGIN_USER.email,
      password: LOGIN_USER.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(LOGIN_USER.email);
    expect(res.body.user.username).toBe(LOGIN_USER.username);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('returns 401 "Invalid credentials" for a wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: LOGIN_USER.email,
      password: 'the-wrong-password',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });

  it('returns 401 "Invalid credentials" for an unknown email (same message as a wrong password)', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'does-not-exist@example.com',
      password: 'whatever123',
    });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid credentials');
  });
});

describe('GET /api/auth/me', () => {
  const ME_USER = {
    email: 'me-user@example.com',
    username: 'me_user',
    password: 'mepassword123',
  };
  let token: string;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send(ME_USER);
    token = res.body.token;
  });

  it('returns the user object for a valid token, without the password field', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(ME_USER.email);
    expect(res.body.username).toBe(ME_USER.username);
    expect(res.body.password).toBeUndefined();
  });

  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a malformed or invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer not-a-real-jwt');

    expect(res.status).toBe(401);
  });
});
