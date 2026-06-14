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
  mockFetchAllProducts.mockResolvedValue([...MOCK_PRODUCTS]);
});

describe('Hidden: frontend API contract', () => {
  it('accepts price-asc sort in frontend hyphenated format', async () => {
    const res = await request(app).get('/products?sort=price-asc&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b));
    expect(prices[0]).toBeLessThanOrEqual(prices[prices.length - 1]);
  });

  it('accepts price-desc sort in frontend hyphenated format', async () => {
    const res = await request(app).get('/products?sort=price-desc&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a: number, b: number) => b - a));
  });

  it('accepts rating-desc sort used by frontend', async () => {
    const res = await request(app).get('/products?sort=rating-desc&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    const ratings = res.body.data.map((p: any) => p.rating);
    expect(ratings).toEqual([...ratings].sort((a: number, b: number) => b - a));
  });

  it('response envelope uses total not count', async () => {
    const res = await request(app).get('/products?limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).not.toHaveProperty('count');
    expect(res.body.total).toBe(15);
  });

  it('response envelope uses totalPages not pages', async () => {
    const res = await request(app).get('/products?limit=5').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalPages');
    expect(res.body).not.toHaveProperty('pages');
    expect(res.body.totalPages).toBe(3);
  });

  it('sort and filter work together with frontend format', async () => {
    const res = await request(app)
      .get('/products?category=electronics&sort=price-asc&limit=50')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: any) => p.category === 'electronics')).toBe(true);
    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b));
  });
});
