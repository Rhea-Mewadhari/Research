import { vi } from 'vitest';

// This file issues many requests across its test cases; the global rateLimiter
// middleware (shared in-memory store, module-level singleton per worker — see
// products.test.ts) would otherwise 429 later tests. Auth-specific rate limiting
// is not part of this task's scope.
vi.mock('../../../benchmark-backend/src/middleware/rateLimiter', () => ({
  rateLimiter: (_req: any, _res: any, next: any) => next(),
}));

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../../../benchmark-backend/src/app';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1] ?? '';
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
}

describe('Hidden: auth foundation — structure', () => {
  it('a migration file creates the users table', () => {
    const migrationsDir = path.resolve(__dirname, '../../db/migrations');
    const files = fs.readdirSync(migrationsDir);
    const usersMigration = files.find((f) => /users/i.test(f));
    expect(usersMigration).toBeDefined();

    const sql = fs.readFileSync(path.join(migrationsDir, usersMigration!), 'utf8');
    expect(sql).toMatch(/CREATE TABLE\s+(IF NOT EXISTS\s+)?users/i);
    expect(sql).toMatch(/UNIQUE/i);
  });

  it('requireJwt is its own middleware file, and requireAuth is untouched', () => {
    const authContent = fs.readFileSync(
      path.resolve(__dirname, '../../middleware/auth.ts'),
      'utf8'
    );
    expect(authContent).not.toMatch(/requireJwt/);

    const jwtMiddlewarePath = path.resolve(__dirname, '../../middleware/requireJwt.ts');
    expect(fs.existsSync(jwtMiddlewarePath)).toBe(true);
  });
});

describe('Hidden: auth foundation — register/login/me edge cases', () => {
  it('does not let extra request fields override the stored user (no mass assignment)', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'mass-assign@example.com',
      username: 'mass_assign_user',
      password: 'validpassword1',
      role: 'admin',
      id: 'attacker-supplied-id',
    });

    expect(res.status).toBe(201);
    expect(res.body.user.id).not.toBe('attacker-supplied-id');
    expect(res.body.user.role).toBeUndefined();
  });

  it('rejects a whitespace-only username with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'whitespace-username@example.com',
      username: '   ',
      password: 'validpassword1',
    });
    expect(res.status).toBe(400);
  });

  it('rejects a whitespace-only email with 400', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: '   ',
      username: 'whitespace_email_user',
      password: 'validpassword1',
    });
    expect(res.status).toBe(400);
  });

  it('register/login are reachable without the benchmark Authorization header', async () => {
    // /api/auth/* must not be gated by the existing requireAuth benchmark scheme
    const res = await request(app).post('/api/auth/register').send({
      email: 'no-benchmark-token@example.com',
      username: 'no_benchmark_token_user',
      password: 'validpassword1',
    });
    expect(res.status).not.toBe(401);
  });

  it('issues a token that expires roughly 24 hours after issuance', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'expiry-check@example.com',
      username: 'expiry_check_user',
      password: 'validpassword1',
    });

    const payload = decodeJwtPayload(res.body.token);
    expect(typeof payload['iat']).toBe('number');
    expect(typeof payload['exp']).toBe('number');

    const lifetimeSeconds = (payload['exp'] as number) - (payload['iat'] as number);
    // 24 hours, with a small tolerance either side
    expect(lifetimeSeconds).toBeGreaterThan(23.5 * 60 * 60);
    expect(lifetimeSeconds).toBeLessThan(24.5 * 60 * 60);
  });

  it('existing benchmark-protected routes still require the benchmark token, unaffected by requireJwt', async () => {
    const res = await request(app).get('/products?limit=5');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('a token issued by login (not just register) is accepted by GET /api/auth/me', async () => {
    const creds = {
      email: 'login-me-flow@example.com',
      username: 'login_me_flow',
      password: 'validpassword1',
    };
    await request(app).post('/api/auth/register').send(creds);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: creds.email, password: creds.password });

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe(creds.email);
  });
});
