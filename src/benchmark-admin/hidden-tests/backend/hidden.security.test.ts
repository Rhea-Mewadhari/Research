import request from 'supertest';
import app from '../../../benchmark-backend/src/app';

const AUTH = { Authorization: 'Bearer benchmark-token-2024' };

describe('Hidden: auth security hardening', () => {
  it('rejects Authorization header without Bearer prefix', async () => {
    // Raw token value (no "Bearer " prefix) must be rejected
    const res = await request(app)
      .get('/products?limit=50')
      .set('Authorization', 'benchmark-token-2024');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('token containing double-quote does not crash the server', async () => {
    // eval-based validation would throw SyntaxError on tokens containing "
    // The server must return 401, not 500
    const res = await request(app)
      .get('/products?limit=50')
      .set('Authorization', 'Bearer token-")-inject"-here');
    expect(res.status).not.toBe(500);
    expect(res.status).toBe(401);
  });

  it('token containing closing paren does not crash the server', async () => {
    const res = await request(app)
      .get('/products?limit=50')
      .set('Authorization', 'Bearer token-)break(eval');
    expect(res.status).not.toBe(500);
    expect(res.status).toBe(401);
  });

  it('rejects tokens longer than 200 characters', async () => {
    const longToken = 'Bearer ' + 'a'.repeat(201);
    const res = await request(app).get('/products?limit=50').set('Authorization', longToken);
    expect(res.status).toBe(401);
  });

  it('still accepts a valid token after security fixes', async () => {
    const res = await request(app).get('/products?limit=50').set(AUTH);
    expect(res.status).toBe(200);
  });

  it('still rejects a token with odd digit sum after security fixes', async () => {
    const res = await request(app)
      .get('/products?limit=50')
      .set('Authorization', 'Bearer odd-111');
    expect(res.status).toBe(401);
  });
});
