import request from 'supertest';
import app from '../../app';

describe('GET /api/products/compare', () => {
  it('returns 200 with matching products for two valid ids', async () => {
    const res = await request(app).get('/api/products/compare?ids=1,2');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products).toHaveLength(2);
    expect(res.body.count).toBe(2);
  });

  it('returns 400 when fewer than two ids are provided', async () => {
    const res = await request(app).get('/api/products/compare?ids=1');
    expect(res.status).toBe(400);
  });

  it('includes id and name in each returned product', async () => {
    const res = await request(app).get('/api/products/compare?ids=1,2');
    expect(res.status).toBe(200);
    expect(res.body.products.every((p: any) => p.id && p.name)).toBe(true);
  });
});
