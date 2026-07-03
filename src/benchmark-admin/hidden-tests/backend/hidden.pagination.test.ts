import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import request from 'supertest';
import app from '../../../benchmark-backend/src/app';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH = { Authorization: 'Bearer benchmark-token-2024' };

describe('Hidden: filter-aware total count', () => {
  it('GET /products?category=electronics&limit=10 reports total matching the filter, not all products', async () => {
    // Fixture has 4 electronics products (ids 1-4).
    // Bug 1: COUNT(*) without WHERE always returns 15 — total stays 15 regardless of filter.
    const res = await request(app)
      .get('/products?category=electronics&limit=10')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
  });

  it('GET /products?featured=true&limit=3 returns exactly 3 featured products on page 1', async () => {
    // Fixture has 4 featured products (ids 1, 8, 11, 14).
    // Bug 2: featured not in SQL WHERE — page slice runs first (ids 1-3), then JS filters
    // → only id 1 is featured → data.length becomes 1 instead of 3.
    const res = await request(app)
      .get('/products?featured=true&limit=3')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(3);
    expect(res.body.data.every((p: { featured: boolean }) => p.featured)).toBe(true);
  });

  it('GET /products?featured=true&limit=3&page=2 returns the remaining featured product', async () => {
    // Correct: 4 featured products, page 2 with limit 3 → 1 product (id 14).
    // Bug 2: SQL page 2 returns ids 4-6, JS filter → none featured → empty page.
    const res = await request(app)
      .get('/products?featured=true&limit=3&page=2')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p: { featured: boolean }) => p.featured)).toBe(true);
  });

  it('GET /products?inStock=true&limit=6 computes totalPages with ceil, not floor', async () => {
    // Fixture has 11 in-stock products. ceil(11/6) = 2; floor(11/6) = 1.
    // Bug 3: Math.floor — totalPages becomes 1 instead of 2.
    const res = await request(app)
      .get('/products?inStock=true&limit=6')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.totalPages).toBe(2);
  });
});

describe('Hidden: productService structural checks', () => {
  it('productService uses a filtered COUNT query', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/services/productService.ts'),
      'utf8'
    );
    // Bug 1 pattern: bare COUNT without WHERE — must include the WHERE placeholder
    expect(content).not.toMatch(/SELECT COUNT\(\*\) AS count FROM products\s*[`'"]/);
  });

  it('productService applies the featured filter in SQL, not in JS', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/services/productService.ts'),
      'utf8'
    );
    // Bug 2 pattern: featured applied via Array.filter after pagination
    expect(content).not.toMatch(/\.filter\(\s*\(p\)\s*=>\s*p\.featured/);
  });

  it('productService uses Math.ceil for totalPages', () => {
    const content = fs.readFileSync(
      path.resolve(__dirname, '../src/services/productService.ts'),
      'utf8'
    );
    expect(content).toMatch(/Math\.ceil\(/);
    expect(content).not.toMatch(/Math\.floor\(/);
  });
});
