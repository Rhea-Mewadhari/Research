import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../../../benchmark-backend/src/app';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Hidden: compare endpoint reachability', () => {
  it('GET /api/products/compare?ids=1,2 returns 200 with a products array', async () => {
    const res = await request(app).get('/api/products/compare?ids=1,2');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products).toHaveLength(2);
    expect(res.body.count).toBe(2);
  });

  it('GET /api/products/1 returns the product at that id', async () => {
    const res = await request(app).get('/api/products/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe('1');
  });

  it('GET /api/products/99999 returns 404 for a non-existent id', async () => {
    const res = await request(app).get('/api/products/99999');
    expect(res.status).toBe(404);
  });
});

describe('Hidden: route registration order', () => {
  it('/compare is registered before /:id in apiProductRoutes.ts', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/routes/apiProductRoutes.ts'),
      'utf8'
    );
    const comparePos = content.indexOf("'/compare'");
    const idParamPos = content.indexOf("'/:id'");
    expect(comparePos).toBeGreaterThan(-1);
    expect(idParamPos).toBeGreaterThan(-1);
    expect(comparePos).toBeLessThan(idParamPos);
  });

  it('getById does not contain a guard for the literal string "compare"', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/controllers/productController.ts'),
      'utf8'
    );
    expect(content).not.toMatch(/'compare'/);
    expect(content).not.toMatch(/"compare"/);
  });
});
