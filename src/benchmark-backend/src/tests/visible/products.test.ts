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
  describe('Search', () => {
    it('returns only Laptop when search=LAPTOP (case-insensitive)', async () => {
      const res = await request(app).get('/products?search=LAPTOP').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Laptop');
    });

    it('returns only Smartphone when search=smart (partial match)', async () => {
      const res = await request(app).get('/products?search=smart').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Smartphone');
    });

    it('returns only Linen Shirt when search=%20shirt%20 (URL-encoded spaces trimmed)', async () => {
      const res = await request(app).get('/products?search=%20shirt%20').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toBe('Linen Shirt');
    });
  });

  describe('Filtering', () => {
    it('returns 4 electronics products when category=electronics', async () => {
      const res = await request(app).get('/products?category=electronics').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(4);
      expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
    });

    it('returns 4 electronics products when category=ELECTRONICS (case-insensitive)', async () => {
      const res = await request(app).get('/products?category=ELECTRONICS').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(4);
    });

    it('returns 11 products when inStock=true', async () => {
      const res = await request(app).get('/products?inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(11);
      expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === true)).toBe(true);
    });

    it('returns 4 products when inStock=false', async () => {
      const res = await request(app).get('/products?inStock=false').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(4);
      expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === false)).toBe(true);
    });

    it('returns empty results when category=nonexistent', async () => {
      const res = await request(app).get('/products?category=nonexistent').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
      expect(res.body.total).toBe(0);
    });
  });

  describe('Sorting', () => {
    it('sorts by price ascending when sort=price_asc', async () => {
      const res = await request(app).get('/products?sort=price_asc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Jump Rope');
      expect(res.body.data[14].name).toBe('Laptop');
    });

    it('sorts by price descending when sort=price_desc', async () => {
      const res = await request(app).get('/products?sort=price_desc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Laptop');
      expect(res.body.data[14].name).toBe('Jump Rope');
    });

    it('sorts by name ascending when sort=name_asc', async () => {
      const res = await request(app).get('/products?sort=name_asc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Bookshelf');
      expect(res.body.data[14].name).toBe('Yoga Mat');
    });

    it('sorts by name descending when sort=name_desc', async () => {
      const res = await request(app).get('/products?sort=name_desc&limit=50').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.data[0].name).toBe('Yoga Mat');
      expect(res.body.data[14].name).toBe('Bookshelf');
    });
  });

  describe('Combined filters', () => {
    it('returns 3 items when category=electronics&inStock=true', async () => {
      const res = await request(app).get('/products?category=electronics&inStock=true').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      expect(res.body.data.every((p: { category: string; inStock: boolean }) => p.category === 'electronics' && p.inStock === true)).toBe(true);
    });

    it('returns clothing sorted by price asc when category=clothing&sort=price_asc', async () => {
      const res = await request(app).get('/products?category=clothing&sort=price_asc').set(AUTH);
      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      expect(res.body.data.map((p: { name: string }) => p.name)).toEqual(['Linen Shirt', 'Running Shoes', 'Winter Jacket']);
    });
  });
});

describe('Pagination', () => {
  it('returns default pagination (page=1, limit=10) with correct metadata', async () => {
    const res = await request(app).get('/products').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(15);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.data.length).toBe(10);
  });

  it('returns page 2 with 5 items and no id overlap with page 1', async () => {
    const page1 = await request(app).get('/products?page=1').set(AUTH);
    const page2 = await request(app).get('/products?page=2').set(AUTH);
    expect(page2.status).toBe(200);
    expect(page2.body.page).toBe(2);
    expect(page2.body.data.length).toBe(5);
    const page1Ids = new Set(page1.body.data.map((p: { id: number }) => p.id));
    const overlap = page2.body.data.some((p: { id: number }) => page1Ids.has(p.id));
    expect(overlap).toBe(false);
  });

  it('clamps limit to 50 when limit=100 is requested', async () => {
    const res = await request(app).get('/products?limit=100').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
    expect(res.body.data.length).toBe(15);
    expect(res.body.totalPages).toBe(1);
  });
});

describe('Auth middleware', () => {
  it('returns 401 when no Authorization header is provided', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 401 when token has odd digit sum (Bearer bad-token-1, digit sum=1)', async () => {
    const res = await request(app).get('/products').set('Authorization', 'Bearer bad-token-1');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 200 when token has even digit sum (Bearer benchmark-token-2024, digit sum=8)', async () => {
    const res = await request(app).get('/products').set('Authorization', 'Bearer benchmark-token-2024');
    expect(res.status).toBe(200);
  });

  it('returns 200 for GET /health with no Authorization header', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
