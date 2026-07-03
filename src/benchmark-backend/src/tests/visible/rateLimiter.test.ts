import request from 'supertest';
import app from '../../app';

// These tests verify that basic rate limiting is enforced.
// They do NOT test: timestamp pruning, Retry-After accuracy, or /health exemption.
// All tests in this file pass even when those three issues are present (intentional).

describe('Rate limiter — basic enforcement', () => {
  it('allows the first 10 requests from the same IP within the window', async () => {
    for (let i = 0; i < 10; i++) {
      const res = await request(app).get('/api/products/compare?ids=1,2');
      expect(res.status).not.toBe(429);
    }
  });

  it('returns 429 with a Retry-After header on the request that exceeds the limit', async () => {
    const res = await request(app).get('/api/products/compare?ids=1,2');
    expect(res.status).toBe(429);
    expect(res.headers['retry-after']).toBeDefined();
  });
});
