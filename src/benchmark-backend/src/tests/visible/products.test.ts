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
  it('sort=price_asc returns cheapest product first', async () => {
    const res = await request(app).get('/products').query({ sort: 'price_asc', limit: 15 }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data[0].price).toBe(19);
  });

  it('sort=price_desc returns most expensive product first', async () => {
    const res = await request(app).get('/products').query({ sort: 'price_desc', limit: 15 }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data[0].price).toBe(999);
  });

  it('sort=name_asc returns alphabetically first product first', async () => {
    const res = await request(app).get('/products').query({ sort: 'name_asc', limit: 15 }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Bookshelf');
  });

  it('sort=name_desc returns alphabetically last product first', async () => {
    const res = await request(app).get('/products').query({ sort: 'name_desc', limit: 15 }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Yoga Mat');
  });

  it('category=electronics returns 4 electronics products', async () => {
    const res = await request(app).get('/products').query({ category: 'electronics' }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    expect(res.body.data).toHaveLength(4);
    expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
  });

  it('category=ELECTRONICS (uppercase) returns 4 electronics products', async () => {
    const res = await request(app).get('/products').query({ category: 'ELECTRONICS' }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
  });

  it('inStock=true returns 11 in-stock products', async () => {
    const res = await request(app).get('/products').query({ inStock: 'true', limit: 15 }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(11);
    expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === true)).toBe(true);
  });

  it('inStock=false returns 4 out-of-stock products', async () => {
    const res = await request(app).get('/products').query({ inStock: 'false' }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === false)).toBe(true);
  });

  it('category=unknowncategory returns empty results', async () => {
    const res = await request(app).get('/products').query({ category: 'unknowncategory' }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.data).toEqual([]);
  });

  it('search=LAPTOP returns Laptop (case-insensitive)', async () => {
    const res = await request(app).get('/products').query({ search: 'LAPTOP' }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Laptop');
  });

  it('search=lap returns Laptop (partial match)', async () => {
    const res = await request(app).get('/products').query({ search: 'lap' }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Laptop');
  });

  it('search with surrounding whitespace returns Laptop (trimmed)', async () => {
    const res = await request(app).get('/products?search=%20Laptop%20').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Laptop');
  });

  it('category=electronics&inStock=true returns 3 in-stock electronics', async () => {
    const res = await request(app).get('/products').query({ category: 'electronics', inStock: 'true' }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.data.every((p: { category: string; inStock: boolean }) => p.category === 'electronics' && p.inStock === true)).toBe(true);
  });

  it('category=sports&sort=price_asc returns Jump Rope first', async () => {
    const res = await request(app).get('/products').query({ category: 'sports', sort: 'price_asc' }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.data[0].name).toBe('Jump Rope');
  });
});

describe('Pagination', () => {
  it('GET /products with no params returns default paginated envelope', async () => {
    const res = await request(app).get('/products').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(10);
    expect(res.body.total).toBe(15);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.totalPages).toBe(2);
  });

  it('page=2&limit=10 returns second page with 5 items', async () => {
    const res = await request(app).get('/products').query({ page: 2, limit: 10 }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.data[0].id).not.toBe(1);
  });

  it('limit=100 is clamped to 50', async () => {
    const res = await request(app).get('/products').query({ limit: 100 }).set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
  });
});

describe('Auth middleware', () => {
  it('GET /products with no Authorization header returns 401', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('GET /products with odd digit-sum token returns 401', async () => {
    const res = await request(app).get('/products').set('Authorization', 'Bearer benchmark-token-2025');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('GET /products with even digit-sum token returns 200', async () => {
    const res = await request(app).get('/products').set('Authorization', 'Bearer benchmark-token-2024');
    expect(res.status).toBe(200);
  });

  it('GET /health with no Authorization header returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
  });
});
