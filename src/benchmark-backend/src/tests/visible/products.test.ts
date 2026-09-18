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
  it('inStock=true returns only in-stock products', async () => {
    const res = await request(app).get('/products').query({ inStock: 'true' }).set(AUTH);
    expect(res.body.total).toBe(11);
    expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === true)).toBe(true);
  });

  it('inStock=false returns only out-of-stock products', async () => {
    const res = await request(app).get('/products').query({ inStock: 'false' }).set(AUTH);
    expect(res.body.total).toBe(4);
    expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === false)).toBe(true);
  });

  it('category=electronics returns 4 electronics products', async () => {
    const res = await request(app).get('/products').query({ category: 'electronics' }).set(AUTH);
    expect(res.body.total).toBe(4);
    expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
  });

  it('category=ELECTRONICS returns 4 electronics products (case-insensitive)', async () => {
    const res = await request(app).get('/products').query({ category: 'ELECTRONICS' }).set(AUTH);
    expect(res.body.total).toBe(4);
    expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
  });

  it('category=nonexistent returns empty data and total 0', async () => {
    const res = await request(app).get('/products').query({ category: 'nonexistent' }).set(AUTH);
    expect(res.body.data.length).toBe(0);
    expect(res.body.total).toBe(0);
  });

  it('search=LAPTOP returns 1 product named Laptop (case-insensitive)', async () => {
    const res = await request(app).get('/products').query({ search: 'LAPTOP' }).set(AUTH);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Laptop');
  });

  it('search=phone returns products with phone in name (partial match)', async () => {
    const res = await request(app).get('/products').query({ search: 'phone' }).set(AUTH);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].name).toBe('Smartphone');
  });

  it('search with surrounding whitespace is trimmed', async () => {
    const res = await request(app).get('/products').query({ search: ' laptop ' }).set(AUTH);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Laptop');
  });

  it('sort=price_asc returns products in ascending price order', async () => {
    const res = await request(app).get('/products').query({ sort: 'price_asc' }).set(AUTH);
    expect(res.body.data[0].price).toBe(19);
    const data: { price: number }[] = res.body.data;
    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i].price).toBeLessThanOrEqual(data[i + 1].price);
    }
  });

  it('sort=price_desc returns products in descending price order', async () => {
    const res = await request(app).get('/products').query({ sort: 'price_desc' }).set(AUTH);
    expect(res.body.data[0].price).toBe(999);
    const data: { price: number }[] = res.body.data;
    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i].price).toBeGreaterThanOrEqual(data[i + 1].price);
    }
  });

  it('sort=name_asc returns products in ascending alphabetical order', async () => {
    const res = await request(app).get('/products').query({ sort: 'name_asc' }).set(AUTH);
    expect(res.body.data[0].name).toBe('Bookshelf');
    const data: { name: string }[] = res.body.data;
    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i].name.localeCompare(data[i + 1].name)).toBeLessThanOrEqual(0);
    }
  });

  it('sort=name_desc returns products in descending alphabetical order', async () => {
    const res = await request(app).get('/products').query({ sort: 'name_desc' }).set(AUTH);
    expect(res.body.data[0].name).toBe('Yoga Mat');
    const data: { name: string }[] = res.body.data;
    for (let i = 0; i < data.length - 1; i++) {
      expect(data[i].name.localeCompare(data[i + 1].name)).toBeGreaterThanOrEqual(0);
    }
  });

  it('category=electronics&inStock=true returns 3 products (AND logic)', async () => {
    const res = await request(app).get('/products').query({ category: 'electronics', inStock: 'true' }).set(AUTH);
    expect(res.body.total).toBe(3);
    expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
    expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === true)).toBe(true);
  });
});

describe('Pagination', () => {
  it('default request returns 10 items, total 15, page 1, limit 10, totalPages 2', async () => {
    const res = await request(app).get('/products').set(AUTH);
    expect(res.body.data.length).toBe(10);
    expect(res.body.total).toBe(15);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.totalPages).toBe(2);
  });

  it('page=2&limit=10 returns 5 items with no id overlap with page 1', async () => {
    const page1 = await request(app).get('/products').query({ page: 1, limit: 10 }).set(AUTH);
    const page1Ids = new Set(page1.body.data.map((p: { id: number }) => p.id));
    const page2 = await request(app).get('/products').query({ page: 2, limit: 10 }).set(AUTH);
    expect(page2.body.data.length).toBe(5);
    expect(page2.body.page).toBe(2);
    expect(page2.body.total).toBe(15);
    expect(page2.body.limit).toBe(10);
    expect(page2.body.totalPages).toBe(2);
    expect(page2.body.data.every((p: { id: number }) => !page1Ids.has(p.id))).toBe(true);
  });

  it('limit=100 is clamped to 50, returns all 15 products, totalPages 1', async () => {
    const res = await request(app).get('/products').query({ limit: 100 }).set(AUTH);
    expect(res.body.limit).toBe(50);
    expect(res.body.data.length).toBe(15);
    expect(res.body.totalPages).toBe(1);
  });
});

describe('Auth middleware', () => {
  it('no Authorization header returns 401 Unauthorized', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('invalid token with odd digit sum returns 401 Unauthorized', async () => {
    const res = await request(app).get('/products').set({ Authorization: 'Bearer benchmark-token-2025' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('valid token with even digit sum returns 200', async () => {
    const res = await request(app).get('/products').set(AUTH);
    expect(res.status).toBe(200);
  });

  it('GET /health with no Authorization header returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
