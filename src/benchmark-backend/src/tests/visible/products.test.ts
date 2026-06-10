import { vi } from 'vitest';

const mockFetchAllProducts = vi.hoisted(() => vi.fn());

vi.mock('../../services/dataFetcher', () => ({
  fetchAllProducts: mockFetchAllProducts,
}));

import request from 'supertest';
import app from '../../app';
import { products as MOCK_PRODUCTS } from '../../data/products';

const AUTH = { Authorization: 'Bearer benchmark-token-2024' };

beforeAll(() => {
  mockFetchAllProducts.mockResolvedValue([...MOCK_PRODUCTS]);
});

describe('GET /products', () => {
  it('returns all products with pagination envelope', async () => {
    const res = await request(app).get('/products?limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(15);
    expect(res.body.data.length).toBe(15);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/products?category=electronics&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(4);
    expect(res.body.data.every((p: any) => p.category === 'electronics')).toBe(true);
  });

  it('returns empty array for unknown category', async () => {
    const res = await request(app).get('/products?category=nonexistent&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('filters in-stock products', async () => {
    const res = await request(app).get('/products?inStock=true&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(11);
    expect(res.body.data.every((p: any) => p.inStock)).toBe(true);
  });

  it('filters out-of-stock products', async () => {
    const res = await request(app).get('/products?inStock=false&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: any) => !p.inStock)).toBe(true);
  });

  it('sorts by price ascending', async () => {
    const res = await request(app).get('/products?sort=price_asc&limit=50').set(AUTH);
    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('sorts by price descending', async () => {
    const res = await request(app).get('/products?sort=price_desc&limit=50').set(AUTH);
    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('sorts by name ascending', async () => {
    const res = await request(app).get('/products?sort=name_asc&limit=50').set(AUTH);
    const names = res.body.data.map((p: any) => p.name);
    expect(names).toEqual([...names].sort());
  });

  it('sorts by name descending', async () => {
    const res = await request(app).get('/products?sort=name_desc&limit=50').set(AUTH);
    const names = res.body.data.map((p: any) => p.name);
    expect(names).toEqual([...names].sort().reverse());
  });

  it('filters by search term', async () => {
    const res = await request(app).get('/products?search=laptop&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p: any) => p.name.toLowerCase().includes('laptop'))).toBe(true);
  });

  it('returns empty data array when search matches nothing', async () => {
    const res = await request(app).get('/products?search=xyznonexistent&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 401 without auth header', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
  });
});

describe('Pagination', () => {
  it('returns correct envelope shape for first page', async () => {
    const res = await request(app).get('/products?page=1&limit=5').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.total).toBe(15);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
    expect(res.body.totalPages).toBe(3);
  });

  it('returns a different set of products for page 2', async () => {
    const page1 = await request(app).get('/products?page=1&limit=5').set(AUTH);
    const page2 = await request(app).get('/products?page=2&limit=5').set(AUTH);
    expect(page2.body.page).toBe(2);
    expect(page2.body.data.length).toBe(5);
    expect(page2.body.data).not.toEqual(page1.body.data);
  });

  it('clamps limit to a maximum of 50', async () => {
    const res = await request(app).get('/products?limit=100').set(AUTH);
    expect(res.body.limit).toBe(50);
    expect(res.body.data.length).toBeLessThanOrEqual(50);
  });
});

describe('Auth middleware', () => {
  it('rejects a token whose digits sum to an odd number', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer invalid-111');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('accepts any token whose digits sum to an even number', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer custom-token-22');
    expect(res.status).toBe(200);
  });

  it('rejects a request with no Bearer prefix', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'benchmark-token-2024');
    expect(res.status).toBe(401);
  });

  it('does not apply auth to the /health route', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
