import request from 'supertest';
import app from '../../app';

describe('Error propagation', () => {
  it('POST /api/favourites with a non-existent productId returns 404', async () => {
    const res = await request(app)
      .post('/api/favourites')
      .send({ productId: '99999' });
    expect(res.status).toBe(404);
  });

  it('GET /api/products/compare with fewer than two ids returns 400', async () => {
    const res = await request(app).get('/api/products/compare?ids=1');
    expect(res.status).toBe(400);
  });

  it('GET /api/products/compare with valid format but non-existent ids returns 400', async () => {
    const res = await request(app).get('/api/products/compare?ids=9999,9998');
    expect(res.status).toBe(400);
  });
});
