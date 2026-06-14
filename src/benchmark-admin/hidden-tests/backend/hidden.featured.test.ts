import { vi } from 'vitest';

const mockFetchAllProducts = vi.hoisted(() => vi.fn());

vi.mock('../../../benchmark-backend/src/services/dataFetcher', () => ({
  fetchAllProducts: mockFetchAllProducts,
}));

import request from 'supertest';
import app from '../../../benchmark-backend/src/app';
import { products as MOCK_PRODUCTS } from '../../../benchmark-backend/src/data/products';

const AUTH = { Authorization: 'Bearer benchmark-token-2024' };

beforeAll(() => {
  // Use MOCK_PRODUCTS directly so the featured field is preserved.
  // (The global fetch stub in tests/setup.ts goes through a mapping pipeline
  // that strips fields not in the DummyJSON schema.)
  mockFetchAllProducts.mockResolvedValue([...MOCK_PRODUCTS]);
});

describe('Hidden: featured filter', () => {
  it('featured=true returns exactly 4 products', async () => {
    const res = await request(app).get('/products?featured=true&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(4);
  });

  it('featured=true products all have featured === true', async () => {
    const res = await request(app).get('/products?featured=true&limit=50').set(AUTH);
    expect(res.body.data.every((p: any) => p.featured === true)).toBe(true);
  });

  it('featured=false returns 11 non-featured products', async () => {
    const res = await request(app).get('/products?featured=false&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(11);
    expect(res.body.data.every((p: any) => !p.featured)).toBe(true);
  });

  it('featured=true + category=electronics returns only Laptop (id 1)', async () => {
    const res = await request(app)
      .get('/products?featured=true&category=electronics&limit=50')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(1);
  });

  it('featured=true + category=furniture returns only Ergonomic Chair (id 8)', async () => {
    const res = await request(app)
      .get('/products?featured=true&category=furniture&limit=50')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].id).toBe(8);
  });
});

describe('Hidden: rating_desc sort', () => {
  it('sort=rating_desc returns products sorted by rating highest first', async () => {
    const res = await request(app).get('/products?sort=rating_desc&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    const ratings = res.body.data.map((p: any) => p.rating);
    expect(ratings).toEqual([...ratings].sort((a: number, b: number) => b - a));
  });

  it('first product with sort=rating_desc has the highest rating (4.9)', async () => {
    const res = await request(app).get('/products?sort=rating_desc&limit=50').set(AUTH);
    expect(res.body.data[0].rating).toBe(4.9);
  });

  it('sort=rating_desc still respects featured filter', async () => {
    const res = await request(app)
      .get('/products?featured=true&sort=rating_desc&limit=50')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(4);
    expect(res.body.data.every((p: any) => p.featured === true)).toBe(true);
    const ratings = res.body.data.map((p: any) => p.rating);
    expect(ratings).toEqual([...ratings].sort((a: number, b: number) => b - a));
  });
});
