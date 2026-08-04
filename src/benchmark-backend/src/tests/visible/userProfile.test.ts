import { vi } from 'vitest';

// See src/tests/visible/auth.test.ts for why this is bypassed: many requests
// per file would otherwise exhaust the shared in-memory rate limiter store.
vi.mock('../../middleware/rateLimiter', () => ({
  rateLimiter: (_req: any, _res: any, next: any) => next(),
}));

import request from 'supertest';
import app from '../../app';
import { db } from '../../db/client';

async function registerUser(overrides: Partial<{ email: string; username: string; password: string }> = {}) {
  const user = {
    email: 'profile-owner@example.com',
    username: 'profile_owner',
    password: 'validpassword1',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(user);
  return { ...user, id: res.body.user.id, token: res.body.token as string };
}

describe('GET /api/auth/me — ownership', () => {
  it("returns only the caller's own data regardless of a spoofed id in the URL", async () => {
    const other = await registerUser({
      email: 'other-user@example.com',
      username: 'other_user',
    });
    const mine = await registerUser({
      email: 'me-user-profile@example.com',
      username: 'me_user_profile',
    });

    const res = await request(app)
      .get(`/api/auth/me?id=${other.id}&userId=${other.id}`)
      .set('Authorization', `Bearer ${mine.token}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(mine.id);
    expect(res.body.email).toBe(mine.email);
    expect(res.body.username).toBe(mine.username);
  });
});

describe('PATCH /api/users/me', () => {
  it('requires a valid JWT', async () => {
    const res = await request(app).patch('/api/users/me').send({ username: 'whoever' });
    expect(res.status).toBe(401);
  });

  it('updates the username and returns the new user object', async () => {
    const user = await registerUser({
      email: 'username-change@example.com',
      username: 'before_username_change',
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ username: 'after_username_change' });

    expect(res.status).toBe(200);
    expect(res.body.user.username).toBe('after_username_change');
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.password).toBeUndefined();
  });

  it('returns 400 for an empty body / no recognised fields', async () => {
    const user = await registerUser({
      email: 'empty-body@example.com',
      username: 'empty_body_user',
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns 400 when newPassword is given without currentPassword', async () => {
    const user = await registerUser({
      email: 'missing-current-pw@example.com',
      username: 'missing_current_pw_user',
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ newPassword: 'brandnewpassword1' });

    expect(res.status).toBe(400);
  });

  it('returns 400 "Current password is incorrect" when currentPassword is wrong', async () => {
    const user = await registerUser({
      email: 'wrong-current-pw@example.com',
      username: 'wrong_current_pw_user',
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ currentPassword: 'not-the-real-password', newPassword: 'brandnewpassword1' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Current password is incorrect');
  });

  it('updates the password so a subsequent login with the new password succeeds and the old one fails', async () => {
    const user = await registerUser({
      email: 'password-change@example.com',
      username: 'password_change_user',
      password: 'the-old-password1',
    });

    const patchRes = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ currentPassword: 'the-old-password1', newPassword: 'the-new-password1' });
    expect(patchRes.status).toBe(200);

    const oldLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'the-old-password1' });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'the-new-password1' });
    expect(newLogin.status).toBe(200);
  });

  it('stores the updated password as a bcrypt hash, not plaintext', async () => {
    const user = await registerUser({
      email: 'hash-after-update@example.com',
      username: 'hash_after_update_user',
      password: 'the-old-password2',
    });

    await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ currentPassword: 'the-old-password2', newPassword: 'the-new-password2' });

    const row = db
      .prepare('SELECT password FROM users WHERE email = ?')
      .get(user.email) as { password: string } | undefined;

    expect(row).toBeDefined();
    expect(row!.password).not.toBe('the-new-password2');
    expect(row!.password).toMatch(/^\$2[aby]?\$/);
  });

  it('returns 409 for an email already taken by another user, and leaves no field changed', async () => {
    const taken = await registerUser({
      email: 'already-taken@example.com',
      username: 'already_taken_owner',
    });
    const user = await registerUser({
      email: 'wants-taken-email@example.com',
      username: 'wants_taken_email_user',
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ username: 'renamed_before_conflict', email: taken.email });

    expect(res.status).toBe(409);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${user.token}`);
    expect(me.body.username).toBe('wants_taken_email_user');
    expect(me.body.email).toBe('wants-taken-email@example.com');
  });

  it('returns 409 for a username already taken by another user', async () => {
    const taken = await registerUser({
      email: 'username-taken-owner@example.com',
      username: 'username_taken_owner',
    });
    const user = await registerUser({
      email: 'wants-taken-username@example.com',
      username: 'wants_taken_username_user',
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ username: taken.username });

    expect(res.status).toBe(409);
  });
});
