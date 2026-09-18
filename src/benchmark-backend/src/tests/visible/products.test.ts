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
      expect(res.body.data.every((p: any) => p.category === 'electronics')).toBe(true);
      expect(res.body.data.length).toBe(4);
    });

    it('filters by category (case-insensitive)', async () => {
      const res = await request(app).get('/products?category=Electronics').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.every((p: any) => p.category === 'electronics')).toBe(true);
      expect(res.body.data.length).toBe(4);
    });

    it('filters by inStock=true returns only in-stock products', async () => {
      const res = await request(app).get('/products?inStock=true&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.every((p: any) => p.inStock === true)).toBe(true);
      expect(res.body.data.length).toBe(11);
    });

    it('filters by inStock=false returns only out-of-stock products', async () => {
      const res = await request(app).get('/products?inStock=false').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.every((p: any) => p.inStock === false)).toBe(true);
      expect(res.body.data.length).toBe(4);
    });

    it('unknown category returns empty data array', async () => {
      const res = await request(app).get('/products?category=nonexistent').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(0);
    });
  });

  describe('Search', () => {
    it('matches names case-insensitively', async () => {
      const res = await request(app).get('/products?search=LAPTOP').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });

    it('matches partial name substrings', async () => {
      const res = await request(app).get('/products?search=smart').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Smartphone');
    });

    it('trims leading and trailing whitespace from search term', async () => {
      const res = await request(app).get('/products?search= Laptop ').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });
  });

  describe('Combined filters', () => {
    it('category + inStock=true returns only matching products', async () => {
      const res = await request(app).get('/products?category=electronics&inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.every((p: any) => p.category === 'electronics' && p.inStock === true)).toBe(true);
      expect(res.body.data.length).toBe(3);
    });

    it('category + sort=price_asc returns filtered products in ascending price order', async () => {
      const res = await request(app).get('/products?category=furniture&sort=price_asc').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.every((p: any) => p.category === 'furniture')).toBe(true);
      const prices = res.body.data.map((p: any) => p.price);
      expect(prices[0]).toBe(149);
      expect(prices[prices.length - 1]).toBe(549);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });

    it('search + inStock=true returns only in-stock matched products', async () => {
      const res = await request(app).get('/products?search=yoga&inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Yoga Mat');
      expect(res.body.data[0].inStock).toBe(true);
    });

    it('category + inStock=true + sort=price_asc applies all three params', async () => {
      const res = await request(app).get('/products?category=electronics&inStock=true&sort=price_asc').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.every((p: any) => p.category === 'electronics' && p.inStock === true)).toBe(true);
      const prices = res.body.data.map((p: any) => p.price);
      expect(prices[0]).toBe(89);
      expect(prices[prices.length - 1]).toBe(999);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });
  });

  describe('Sorting', () => {
    it('sort=price_asc returns products lowest price first', async () => {
      const res = await request(app).get('/products?sort=price_asc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const prices = res.body.data.map((p: any) => p.price);
      expect(prices[0]).toBe(19);
      expect(prices[prices.length - 1]).toBe(999);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });

    it('sort=price_desc returns products highest price first', async () => {
      const res = await request(app).get('/products?sort=price_desc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const prices = res.body.data.map((p: any) => p.price);
      expect(prices[0]).toBe(999);
      expect(prices[prices.length - 1]).toBe(19);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
      }
    });

    it('sort=name_asc returns products in alphabetical order', async () => {
      const res = await request(app).get('/products?sort=name_asc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const names = res.body.data.map((p: any) => p.name);
      expect(names[0]).toBe('Bookshelf');
      expect(names[names.length - 1]).toBe('Yoga Mat');
      for (let i = 0; i < names.length - 1; i++) {
        expect(names[i].localeCompare(names[i + 1])).toBeLessThanOrEqual(0);
      }
    });

    it('sort=name_desc returns products in reverse alphabetical order', async () => {
      const res = await request(app).get('/products?sort=name_desc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      const names = res.body.data.map((p: any) => p.name);
      expect(names[0]).toBe('Yoga Mat');
      expect(names[names.length - 1]).toBe('Bookshelf');
      for (let i = 0; i < names.length - 1; i++) {
        expect(names[i].localeCompare(names[i + 1])).toBeGreaterThanOrEqual(0);
      }
    });
  });
});

describe('Pagination', () => {
  it('returns correct envelope shape on page 1', async () => {
    const res = await request(app).get('/products?page=1&limit=10').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      total: 15,
      page: 1,
      limit: 10,
      totalPages: 2,
    });
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(10);
  });

  it('page 2 returns the remaining products', async () => {
    const res = await request(app).get('/products?page=2&limit=10').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.data.length).toBe(5);
  });

  it('different pages return different products', async () => {
    const page1 = await request(app).get('/products?page=1&limit=5').set(AUTH);
    const page2 = await request(app).get('/products?page=2&limit=5').set(AUTH);
    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    const ids1 = page1.body.data.map((p: any) => p.id);
    const ids2 = page2.body.data.map((p: any) => p.id);
    const overlap = ids1.filter((id: number) => ids2.includes(id));
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
    expect(res.body).toMatchObject({ error: 'Unauthorized' });
  });

  it('returns 401 when token digit sum is odd (invalid)', async () => {
    // benchmark-token-2025 → 2+0+2+5 = 9, odd → invalid
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer benchmark-token-2025');
    expect(res.status).toBe(401);
    expect(res.body).toMatchObject({ error: 'Unauthorized' });
  });

  it('returns 200 when token digit sum is even (valid)', async () => {
    // benchmark-token-2024 → 2+0+2+4 = 8, even → valid
    const res = await request(app)
      .get('/products')
      .set(AUTH);
    expect(res.status).toBe(200);
  });

  it('GET /health returns 200 without an Authorization header', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});
