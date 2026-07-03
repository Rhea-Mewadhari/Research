import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../../../benchmark-backend/src/app';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Hidden: error response shape uniformity', () => {
  it('POST /api/favourites with non-existent productId response includes code and requestId', async () => {
    const res = await request(app)
      .post('/api/favourites')
      .send({ productId: '99999' });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('code', 'PRODUCT_NOT_FOUND');
    expect(res.body).toHaveProperty('requestId');
    expect(res.body).not.toHaveProperty('message');
  });

  it('GET /api/products/compare with non-existent ids returns 400 with code and requestId', async () => {
    const res = await request(app).get('/api/products/compare?ids=9999,9998');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('code');
    expect(res.body).toHaveProperty('requestId');
  });
});

describe('Hidden: error middleware wiring', () => {
  it('favouriteController.add does not send inline json with a message field on error', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/controllers/favouriteController.ts'),
      'utf8'
    );
    expect(content).not.toMatch(/\.json\(\s*\{\s*message\s*:/);
  });

  it('compareController.compare passes errors to next(err) — no bare next() in catch', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/controllers/compareController.ts'),
      'utf8'
    );
    expect(content).not.toMatch(/\bnext\(\s*\)/);
  });

  it('rateLimiter uses RateLimitError when calling next(err)', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/middleware/rateLimiter.ts'),
      'utf8'
    );
    expect(content).toContain('RateLimitError');
    expect(content).toMatch(/next\(new RateLimitError/);
  });
});
