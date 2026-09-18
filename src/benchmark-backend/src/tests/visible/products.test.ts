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
    it('filters by category (exact match, lowercase)', async () => {
      const res = await request(app).get('/products?category=electronics').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(4);
      expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
    });

    it('filters by category case-insensitively (uppercase input)', async () => {
      const res = await request(app).get('/products?category=ELECTRONICS').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(4);
      expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
    });

    it('filters by category case-insensitively (mixed case input)', async () => {
      const res = await request(app).get('/products?category=Clothing').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      expect(res.body.data.every((p: { category: string }) => p.category === 'clothing')).toBe(true);
    });

    it('filters by inStock=true — only in-stock products returned', async () => {
      const res = await request(app).get('/products?inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(11);
      expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === true)).toBe(true);
    });

    it('filters by inStock=false — only out-of-stock products returned', async () => {
      const res = await request(app).get('/products?inStock=false').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(4);
      expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === false)).toBe(true);
    });

    it('returns empty data array for an unknown category', async () => {
      const res = await request(app).get('/products?category=nonexistent-category').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(0);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('Search', () => {
    it('matches product names case-insensitively (uppercase search term)', async () => {
      const res = await request(app).get('/products?search=LAPTOP').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });

    it('matches product names on partial substrings', async () => {
      const res = await request(app).get('/products?search=head').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].name).toBe('Wireless Headphones');
    });

    it('trims leading and trailing whitespace from the search term', async () => {
      const res = await request(app).get('/products').query({ search: '  yoga  ' }).set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].name).toBe('Yoga Mat');
    });
  });

  describe('Combined filters', () => {
    it('category + inStock=true returns only in-stock products of that category', async () => {
      // electronics in-stock: Laptop (id:1), Smartphone (id:2), Mechanical Keyboard (id:4) → 3 items
      const res = await request(app).get('/products?category=electronics&inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      expect(res.body.data.every((p: { category: string; inStock: boolean }) =>
        p.category === 'electronics' && p.inStock === true)).toBe(true);
    });

    it('category + sort returns only that category sorted correctly', async () => {
      // books sorted price_asc: Clean Code ($35), The Pragmatic Programmer ($42)
      const res = await request(app).get('/products?category=books&sort=price_asc').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.data[0].name).toBe('Clean Code');
      expect(res.body.data[1].name).toBe('The Pragmatic Programmer');
    });

    it('category + inStock + sort applies all three filters together', async () => {
      // in-stock furniture sorted price_asc: Bookshelf ($149), Ergonomic Chair ($549)
      const res = await request(app)
        .get('/products?category=furniture&inStock=true&sort=price_asc')
        .set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.data[0].name).toBe('Bookshelf');
      expect(res.body.data[1].name).toBe('Ergonomic Chair');
      expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === true)).toBe(true);
    });

    it('inStock=false + sort + pagination applies all params together', async () => {
      // out-of-stock (4 total) sorted price_desc, limit=2:
      // Standing Desk ($399), Winter Jacket ($189) are first page
      const res = await request(app)
        .get('/products?inStock=false&sort=price_desc&limit=2')
        .set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(4);
      expect(res.body.limit).toBe(2);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].name).toBe('Standing Desk');
      expect(res.body.data[1].name).toBe('Winter Jacket');
      expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === false)).toBe(true);
    });
  });

  describe('Sorting', () => {
    it('sort=price_asc returns products with lowest price first', async () => {
      const res = await request(app).get('/products?sort=price_asc&limit=15').set(AUTH);
      expect(res.status).toBe(200);
      const prices: number[] = res.body.data.map((p: { price: number }) => p.price);
      expect(prices[0]).toBe(19); // Jump Rope
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });

    it('sort=price_desc returns products with highest price first', async () => {
      const res = await request(app).get('/products?sort=price_desc&limit=15').set(AUTH);
      expect(res.status).toBe(200);
      const prices: number[] = res.body.data.map((p: { price: number }) => p.price);
      expect(prices[0]).toBe(999); // Laptop
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
      }
    });

    it('sort=name_asc returns products in alphabetical order', async () => {
      const res = await request(app).get('/products?sort=name_asc&limit=15').set(AUTH);
      expect(res.status).toBe(200);
      const names: string[] = res.body.data.map((p: { name: string }) => p.name);
      expect(names[0]).toBe('Bookshelf');
      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i - 1])).toBeGreaterThanOrEqual(0);
      }
    });

    it('sort=name_desc returns products in reverse alphabetical order', async () => {
      const res = await request(app).get('/products?sort=name_desc&limit=15').set(AUTH);
      expect(res.status).toBe(200);
      const names: string[] = res.body.data.map((p: { name: string }) => p.name);
      expect(names[0]).toBe('Yoga Mat');
      for (let i = 1; i < names.length; i++) {
        expect(names[i].localeCompare(names[i - 1])).toBeLessThanOrEqual(0);
      }
    });
  });
});

describe('Pagination', () => {
  it('returns correct envelope shape with expected pagination fields', async () => {
    const res = await request(app).get('/products').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('total', 15);
    expect(res.body).toHaveProperty('page', 1);
    expect(res.body).toHaveProperty('limit', 10);
    expect(res.body).toHaveProperty('totalPages', 2);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(10);
  });

  it('different pages return different products', async () => {
    const page1 = await request(app).get('/products?page=1&limit=10').set(AUTH);
    const page2 = await request(app).get('/products?page=2&limit=10').set(AUTH);
    expect(page1.status).toBe(200);
    expect(page2.status).toBe(200);
    expect(page2.body.page).toBe(2);
    expect(page2.body.data).toHaveLength(5);
    const ids1: number[] = page1.body.data.map((p: { id: number }) => p.id);
    const ids2: number[] = page2.body.data.map((p: { id: number }) => p.id);
    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });

  it('clamps limit to a maximum of 50', async () => {
    const res = await request(app).get('/products?limit=100').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
    expect(res.body.data).toHaveLength(15);
  });
});

describe('Auth middleware', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 401 when token has an odd digit sum (invalid token)', async () => {
    // 'benchmark-token-1': only digit is 1 → sum = 1 (odd) → invalid
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer benchmark-token-1');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 200 when token has an even digit sum (valid token)', async () => {
    // 'benchmark-token-2024': digits 2+0+2+4 = 8 (even) → valid
    const res = await request(app).get('/products').set(AUTH);
    expect(res.status).toBe(200);
  });

  it('/health does not require authentication', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
