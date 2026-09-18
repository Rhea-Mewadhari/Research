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
  describe('Filtering', () => {
    it('filters by category (exact match)', async () => {
      const res = await request(app).get('/products?category=electronics').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(4);
      expect(res.body.data).toHaveLength(4);
      res.body.data.forEach((p: { category: string }) => {
        expect(p.category).toBe('electronics');
      });
    });

    it('filters by category case-insensitively', async () => {
      const res = await request(app).get('/products?category=ELECTRONICS').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(4);
    });

    it('returns empty data for unknown category', async () => {
      const res = await request(app).get('/products?category=nonexistent').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('filters by inStock=true', async () => {
      const res = await request(app).get('/products?inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(11);
      res.body.data.forEach((p: { inStock: boolean }) => {
        expect(p.inStock).toBe(true);
      });
    });

    it('filters by inStock=false', async () => {
      const res = await request(app).get('/products?inStock=false').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(4);
      expect(res.body.data).toHaveLength(4);
      res.body.data.forEach((p: { inStock: boolean }) => {
        expect(p.inStock).toBe(false);
      });
    });
  });

  describe('Search', () => {
    it('matches names case-insensitively', async () => {
      const res = await request(app).get('/products?search=LAPTOP').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });

    it('matches names by partial string', async () => {
      const res = await request(app).get('/products?search=book').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].name).toBe('Bookshelf');
    });

    it('trims whitespace from the search term', async () => {
      const res = await request(app).get('/products').query({ search: '  laptop  ' }).set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });
  });

  describe('Combined filters', () => {
    it('applies category and inStock together', async () => {
      const res = await request(app).get('/products?category=electronics&inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      res.body.data.forEach((p: { category: string; inStock: boolean }) => {
        expect(p.category).toBe('electronics');
        expect(p.inStock).toBe(true);
      });
    });

    it('applies category and sort together', async () => {
      const res = await request(app).get('/products?category=sports&sort=price_asc').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      const prices: number[] = res.body.data.map((p: { price: number }) => p.price);
      expect(prices[0]).toBe(19);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    it('applies search and category together', async () => {
      const res = await request(app).get('/products?search=book&category=furniture').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].name).toBe('Bookshelf');
    });
  });

  describe('Sorting', () => {
    it('sorts by price_asc — cheapest first', async () => {
      const res = await request(app).get('/products?sort=price_asc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const prices: number[] = res.body.data.map((p: { price: number }) => p.price);
      expect(prices[0]).toBe(19);
      expect(prices[prices.length - 1]).toBe(999);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    it('sorts by price_desc — most expensive first', async () => {
      const res = await request(app).get('/products?sort=price_desc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const prices: number[] = res.body.data.map((p: { price: number }) => p.price);
      expect(prices[0]).toBe(999);
      expect(prices[prices.length - 1]).toBe(19);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
      }
    });

    it('sorts by name_asc — alphabetical order', async () => {
      const res = await request(app).get('/products?sort=name_asc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const names: string[] = res.body.data.map((p: { name: string }) => p.name);
      expect(names[0]).toBe('Bookshelf');
      expect(names[names.length - 1]).toBe('Yoga Mat');
      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
      }
    });

    it('sorts by name_desc — reverse alphabetical order', async () => {
      const res = await request(app).get('/products?sort=name_desc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const names: string[] = res.body.data.map((p: { name: string }) => p.name);
      expect(names[0]).toBe('Yoga Mat');
      expect(names[names.length - 1]).toBe('Bookshelf');
      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i - 1])).toBeLessThanOrEqual(0);
      }
    });
  });
});

describe('Pagination', () => {
  it('returns correct envelope shape with default pagination', async () => {
    const res = await request(app).get('/products').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total', 15);
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit', 10);
    expect(res.body).toHaveProperty('totalPages', 2);
    expect(res.body.data).toHaveLength(10);
  });

  it('returns different products on different pages', async () => {
    const page1 = await request(app).get('/products?page=1&limit=5').set(AUTH);
    const page2 = await request(app).get('/products?page=2&limit=5').set(AUTH);
    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page1.body.page).toBe(1);
    expect(page2.body.page).toBe(2);
    const ids1: number[] = page1.body.data.map((p: { id: number }) => p.id);
    const ids2: number[] = page2.body.data.map((p: { id: number }) => p.id);
    expect(ids1).toHaveLength(5);
    expect(ids2).toHaveLength(5);
    expect(ids1.some((id) => ids2.includes(id))).toBe(false);
  });

  it('clamps limit to a maximum of 50', async () => {
    const res = await request(app).get('/products?limit=100').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
    expect(res.body.total).toBe(15);
    expect(res.body.totalPages).toBe(1);
    expect(res.body.data).toHaveLength(15);
  });
});

describe('Auth middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
  });

  it('returns 401 when token has an odd digit sum', async () => {
    // digits 1: sum=1 (odd) — invalid
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer benchmark-token-1');
    expect(res.status).toBe(401);
  });

  it('returns 200 when token has an even digit sum', async () => {
    // digits 2+0+2+4=8 (even) — valid
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer benchmark-token-2024');
    expect(res.status).toBe(200);
  });

  it('/health returns 200 without an Authorization header', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
