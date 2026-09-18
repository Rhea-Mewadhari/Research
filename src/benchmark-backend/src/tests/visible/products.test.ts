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
      const names = res.body.data.map((p: { name: string }) => p.name);
      expect(names).toContain('Laptop');
      expect(names).toContain('Smartphone');
      expect(names).not.toContain('Linen Shirt');
      expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
    });

    it('filters by category (case-insensitive)', async () => {
      const res = await request(app).get('/products?category=ELECTRONICS').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
    });

    it('filters by inStock=true', async () => {
      const res = await request(app).get('/products?inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === true)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('filters by inStock=false', async () => {
      const res = await request(app).get('/products?inStock=false').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === false)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('returns empty data array for unknown category', async () => {
      const res = await request(app).get('/products?category=nonexistent').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(0);
    });
  });

  describe('Search', () => {
    it('matches by name case-insensitively', async () => {
      const res = await request(app).get('/products?search=LAPTOP').set(AUTH);
      expect(res.status).toBe(200);
      const names = res.body.data.map((p: { name: string }) => p.name);
      expect(names).toContain('Laptop');
      expect(res.body.data.every((p: { name: string }) => p.name.toLowerCase().includes('laptop'))).toBe(true);
    });

    it('matches partial name', async () => {
      const res = await request(app).get('/products?search=phone').set(AUTH);
      expect(res.status).toBe(200);
      const names = res.body.data.map((p: { name: string }) => p.name);
      expect(names).toContain('Smartphone');
      expect(res.body.data.every((p: { name: string }) => p.name.toLowerCase().includes('phone'))).toBe(true);
    });

    it('trims whitespace from search term', async () => {
      const res = await request(app).get('/products?search=%20%20laptop%20%20').set(AUTH);
      expect(res.status).toBe(200);
      const names = res.body.data.map((p: { name: string }) => p.name);
      expect(names).toContain('Laptop');
    });
  });

  describe('Sorting', () => {
    it('sorts by price ascending (price_asc)', async () => {
      const res = await request(app).get('/products?sort=price_asc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const prices = res.body.data.map((p: { price: number }) => p.price);
      expect(prices.length).toBeGreaterThan(0);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
      expect(prices[0]).toBe(19); // Jump Rope is cheapest
    });

    it('sorts by price descending (price_desc)', async () => {
      const res = await request(app).get('/products?sort=price_desc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const prices = res.body.data.map((p: { price: number }) => p.price);
      expect(prices.length).toBeGreaterThan(0);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
      }
      expect(prices[0]).toBe(999); // Laptop is most expensive
    });

    it('sorts by name ascending (name_asc)', async () => {
      const res = await request(app).get('/products?sort=name_asc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const names = res.body.data.map((p: { name: string }) => p.name);
      expect(names.length).toBeGreaterThan(0);
      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
      }
      expect(names[0]).toBe('Bookshelf');
    });

    it('sorts by name descending (name_desc)', async () => {
      const res = await request(app).get('/products?sort=name_desc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const names = res.body.data.map((p: { name: string }) => p.name);
      expect(names.length).toBeGreaterThan(0);
      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i - 1])).toBeLessThanOrEqual(0);
      }
      expect(names[0]).toBe('Yoga Mat');
    });
  });

  describe('Combined Filters', () => {
    it('applies category and inStock filters together', async () => {
      const res = await request(app).get('/products?category=electronics&inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      // electronics: Laptop, Smartphone, Wireless Headphones, Mechanical Keyboard (4 total)
      // inStock=true removes Wireless Headphones → 3 remain
      expect(res.body.data.length).toBe(3);
      expect(res.body.data.every((p: { category: string; inStock: boolean }) =>
        p.category === 'electronics' && p.inStock === true
      )).toBe(true);
      const names = res.body.data.map((p: { name: string }) => p.name);
      expect(names).toContain('Laptop');
      expect(names).toContain('Smartphone');
      expect(names).not.toContain('Wireless Headphones');
    });

    it('applies category and sort filters together', async () => {
      const res = await request(app).get('/products?category=sports&sort=price_asc').set(AUTH);
      expect(res.status).toBe(200);
      // sports: Jump Rope ($19), Resistance Bands ($24), Yoga Mat ($39)
      expect(res.body.data.every((p: { category: string }) => p.category === 'sports')).toBe(true);
      const prices = res.body.data.map((p: { price: number }) => p.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
      expect(prices[0]).toBe(19); // Jump Rope is cheapest sports item
    });

    it('applies search and inStock filters together', async () => {
      const res = await request(app).get('/products?search=shirt&inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      // "shirt" matches "Linen Shirt" (inStock=true) only
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Linen Shirt');
      expect(res.body.data[0].inStock).toBe(true);
    });
  });
});

describe('Pagination', () => {
  it('returns correct envelope shape', async () => {
    const res = await request(app).get('/products?page=1&limit=10').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit', 10);
    expect(res.body).toHaveProperty('totalPages');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.total).toBe(15);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.data.length).toBe(10);
  });

  it('different pages return different products', async () => {
    const page1 = await request(app).get('/products?page=1&limit=10').set(AUTH);
    const page2 = await request(app).get('/products?page=2&limit=10').set(AUTH);
    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page2.body.data.length).toBe(5);
    const page1Ids = page1.body.data.map((p: { id: number }) => p.id);
    const page2Ids = page2.body.data.map((p: { id: number }) => p.id);
    const overlap = page1Ids.filter((id: number) => page2Ids.includes(id));
    expect(overlap.length).toBe(0);
  });

  it('clamps limit to a maximum of 50', async () => {
    const res = await request(app).get('/products?limit=100').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
  });
});

describe('Auth middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 when token has an odd digit sum (invalid token)', async () => {
    // "bad-1" has digit sum 1 (odd) → invalid
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer bad-1');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 when token has an even digit sum (valid token)', async () => {
    // "benchmark-token-2024" has digit sum 2+0+2+4=8 (even) → valid
    const res = await request(app)
      .get('/products')
      .set(AUTH);
    expect(res.status).toBe(200);
  });

  it('/health does not require authentication', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
