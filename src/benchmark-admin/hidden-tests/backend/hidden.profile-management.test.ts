import { vi } from 'vitest';

// See hidden.auth-foundation.test.ts / products.test.ts: many requests per file
// would otherwise exhaust the shared in-memory rate limiter store.
vi.mock('../../../benchmark-backend/src/middleware/rateLimiter', () => ({
  rateLimiter: (_req: any, _res: any, next: any) => next(),
}));

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../../../benchmark-backend/src/app';
import { db } from '../../../benchmark-backend/src/db/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function registerUser(overrides: Partial<{ email: string; username: string; password: string }> = {}) {
  const user = {
    email: 'hidden-profile-owner@example.com',
    username: 'hidden_profile_owner',
    password: 'validpassword1',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(user);
  return { ...user, id: res.body.user.id, token: res.body.token as string };
}

describe('Hidden: profile management — structure', () => {
  it('userRoutes.ts guards PATCH /me with requireJwt', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../../routes/userRoutes.ts'),
      'utf8'
    );
    expect(content).toMatch(/requireJwt/);
  });

  it('authController no longer resolves getMe from a URL parameter', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../../controllers/authController.ts'),
      'utf8'
    );
    // The Bug 1 pattern from the spec: reading the target user id off req.params.
    // Deliberately not asserting which property replaces it (req.user,
    // req.jwtUser, etc. are all valid choices) — the actual security property
    // is already covered behaviorally by the ownership check in
    // userProfile.test.ts (spoofed id in the URL must not leak another user's data).
    expect(content).not.toMatch(/req\.params(\.|\[)['"]?id/);
  });
});

describe('Hidden: profile management — PATCH /api/users/me edge cases', () => {
  it('does not let extra request fields override the stored user (no mass assignment)', async () => {
    const user = await registerUser({
      email: 'mass-assign-profile@example.com',
      username: 'mass_assign_profile_user',
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ username: 'mass_assign_profile_user_renamed', role: 'admin', id: 'attacker-id' });

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(user.id);
    expect(res.body.user.role).toBeUndefined();
  });

  it('a username conflict rolls back atomically — email is left unchanged too', async () => {
    const taken = await registerUser({
      email: 'username-conflict-owner@example.com',
      username: 'username_conflict_owner',
    });
    const user = await registerUser({
      email: 'username-conflict-user@example.com',
      username: 'username_conflict_user',
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ email: 'renamed-before-conflict@example.com', username: taken.username });

    expect(res.status).toBe(409);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${user.token}`);
    expect(me.body.email).toBe('username-conflict-user@example.com');
    expect(me.body.username).toBe('username_conflict_user');
  });

  it('a failed PATCH response never contains a password field', async () => {
    const taken = await registerUser({
      email: 'no-pw-leak-owner@example.com',
      username: 'no_pw_leak_owner',
    });
    const user = await registerUser({
      email: 'no-pw-leak-user@example.com',
      username: 'no_pw_leak_user',
    });

    const res = await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ email: taken.email });

    expect(res.status).toBe(409);
    expect(JSON.stringify(res.body)).not.toMatch(/password/i);
  });

  it("changes the stored password hash to a genuinely different value, not the same hash reused", async () => {
    const user = await registerUser({
      email: 'hash-changes@example.com',
      username: 'hash_changes_user',
      password: 'the-first-password1',
    });

    const before = db
      .prepare('SELECT password FROM users WHERE email = ?')
      .get(user.email) as { password: string };

    await request(app)
      .patch('/api/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ currentPassword: 'the-first-password1', newPassword: 'the-second-password1' });

    const after = db
      .prepare('SELECT password FROM users WHERE email = ?')
      .get(user.email) as { password: string };

    expect(after.password).not.toBe(before.password);
    expect(after.password).toMatch(/^\$2[aby]?\$/);
  });

  it('GET /api/auth/me still requires a valid token after the ownership fix', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
