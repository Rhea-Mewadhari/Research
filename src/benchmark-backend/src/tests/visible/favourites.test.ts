import request from 'supertest';
import app from '../../app';

describe('Favourites API — happy path', () => {
  it('POST /api/favourites with a valid productId returns 201 with the favourite', async () => {
    const res = await request(app)
      .post('/api/favourites')
      .send({ productId: '1' });
    expect(res.status).toBe(201);
    expect(res.body.productId).toBe('1');
  });

  it('GET /api/favourites includes the added favourite', async () => {
    const res = await request(app).get('/api/favourites');
    expect(res.status).toBe(200);
    expect(res.body.favourites.some((f: any) => f.productId === '1')).toBe(true);
  });

  it('POST /api/favourites with the same productId is idempotent and returns 200', async () => {
    const res = await request(app)
      .post('/api/favourites')
      .send({ productId: '1' });
    expect(res.status).toBe(200);
    expect(res.body.productId).toBe('1');
  });

  it('DELETE /api/favourites/:productId removes the favourite and returns 204', async () => {
    const res = await request(app).delete('/api/favourites/1');
    expect(res.status).toBe(204);
  });
});
