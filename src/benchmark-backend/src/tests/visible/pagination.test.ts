import request from 'supertest';
import app from '../../app';

const AUTH = { Authorization: 'Bearer benchmark-token-2024' };

describe('Pagination — totalPages boundary', () => {
  it('returns totalPages: 2 for 15 products with limit 10', async () => {
    // 15 products / 10 per page = 1.5 → must round up to 2
    const res = await request(app).get('/products?limit=10').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(15);
    expect(res.body.totalPages).toBe(2);
  });

  it('returns totalPages: 3 for 15 products with limit 5', async () => {
    // 15 products / 5 per page = 3 exactly
    const res = await request(app).get('/products?limit=5').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(15);
    expect(res.body.totalPages).toBe(3);
  });
});
