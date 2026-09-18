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
      expect(res.body.data).toHaveLength(4);
      res.body.data.forEach((p: { category: string }) => {
        expect(p.category).toBe('electronics');
      });
    });

    it('filters by category case-insensitively', async () => {
      const res = await request(app).get('/products?category=ELECTRONICS').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(4);
      res.body.data.forEach((p: { category: string }) => {
        expect(p.category).toBe('electronics');
      });
    });

    it('returns empty data for unknown category', async () => {
      const res = await request(app).get('/products?category=nonexistent').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('filters by inStock=true', async () => {
      const res = await request(app).get('/products?inStock=true&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      res.body.data.forEach((p: { inStock: boolean }) => {
        expect(p.inStock).toBe(true);
      });
      expect(res.body.total).toBe(11);
    });

    it('filters by inStock=false', async () => {
      const res = await request(app).get('/products?inStock=false').set(AUTH);
      expect(res.status).toBe(200);
      res.body.data.forEach((p: { inStock: boolean }) => {
        expect(p.inStock).toBe(false);
      });
      expect(res.body.total).toBe(4);
    });
  });

  describe('Search', () => {
    it('matches names case-insensitively', async () => {
      const res = await request(app).get('/products?search=laptop').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });

    it('matches partial names', async () => {
      const res = await request(app).get('/products?search=head').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Wireless Headphones');
    });

    it('trims whitespace from search term', async () => {
      const res = await request(app).get('/products?search=  laptop  ').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });
  });

  describe('Sorting', () => {
    it('sorts by price ascending', async () => {
      const res = await request(app).get('/products?sort=price_asc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const prices: number[] = res.body.data.map((p: { price: number }) => p.price);
      expect(prices[0]).toBe(19);
      expect(prices[prices.length - 1]).toBe(999);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    it('sorts by price descending', async () => {
      const res = await request(app).get('/products?sort=price_desc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const prices: number[] = res.body.data.map((p: { price: number }) => p.price);
      expect(prices[0]).toBe(999);
      expect(prices[prices.length - 1]).toBe(19);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
      }
    });

    it('sorts by name ascending', async () => {
      const res = await request(app).get('/products?sort=name_asc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const names: string[] = res.body.data.map((p: { name: string }) => p.name);
      expect(names[0]).toBe('Bookshelf');
      expect(names[names.length - 1]).toBe('Yoga Mat');
      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
      }
    });

    it('sorts by name descending', async () => {
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
    const page1 = await request(app).get('/products?page=1&limit=10').set(AUTH);
    const page2 = await request(app).get('/products?page=2&limit=10').set(AUTH);
    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page1.body.data).toHaveLength(10);
    expect(page2.body.data).toHaveLength(5);
    const page1Ids: number[] = page1.body.data.map((p: { id: number }) => p.id);
    const page2Ids: number[] = page2.body.data.map((p: { id: number }) => p.id);
    const overlap = page1Ids.filter((id) => page2Ids.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it('clamps limit to a maximum of 50', async () => {
    const res = await request(app).get('/products?limit=100').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
    expect(res.body.data).toHaveLength(15);
  });
});

describe('Combined filters', () => {
  it('applies category and inStock together', async () => {
    const res = await request(app)
      .get('/products?category=electronics&inStock=true&limit=50')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    res.body.data.forEach((p: { category: string; inStock: boolean }) => {
      expect(p.category).toBe('electronics');
      expect(p.inStock).toBe(true);
    });
  });

  it('applies category and sort together', async () => {
    const res = await request(app)
      .get('/products?category=electronics&sort=price_asc&limit=50')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    const prices: number[] = res.body.data.map((p: { price: number }) => p.price);
    for (let i = 1; i < prices.length; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  });

  it('applies search and inStock together', async () => {
    const res = await request(app)
      .get('/products?search=running&inStock=true')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Running Shoes');
    expect(res.body.data[0].inStock).toBe(true);
  });

  it('applies category with pagination', async () => {
    const res = await request(app)
      .get('/products?category=sports&page=1&limit=2')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.data).toHaveLength(2);
    res.body.data.forEach((p: { category: string }) => {
      expect(p.category).toBe('sports');
    });
  });
});

describe('Auth middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('returns 401 for a token whose digits sum to an odd number', async () => {
    // "bad-token-1" has digits: 1 → sum = 1 (odd) → invalid
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer bad-token-1');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  it('returns 200 for a token whose digits sum to an even number', async () => {
    // "benchmark-token-2024" has digits: 2+0+2+4 = 8 (even) → valid
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer benchmark-token-2024');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('/health does not require auth', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
