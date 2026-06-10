import request from 'supertest';
import app from '../../../benchmark-backend/src/app';

describe('Hidden: auth middleware', () => {
  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/products?limit=50');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 401 when token digit sum is odd', async () => {
    // 'Bearer odd-1' → digits: 1 → sum = 1 (odd) → rejected
    const res = await request(app).get('/products?limit=50').set({ Authorization: 'Bearer odd-1' });
    expect(res.status).toBe(401);
  });

  it('returns 200 when token digit sum is even', async () => {
    // 'Bearer even-2' → digits: 2 → sum = 2 (even) → accepted
    const res = await request(app).get('/products?limit=50').set({ Authorization: 'Bearer even-2' });
    expect(res.status).toBe(200);
  });

  it('/health endpoint works without auth', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
