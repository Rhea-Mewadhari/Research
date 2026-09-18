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
  it('search=laptop (case-insensitive) returns 1 result matching Laptop', async () => {
    const res = await request(app).get('/products?search=laptop').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Laptop');
  });

  it('search=wire (partial match) returns 1 result matching Wireless Headphones', async () => {
    const res = await request(app).get('/products?search=wire').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Wireless Headphones');
  });

  it('search=%20laptop%20 (URL-encoded spaces trimmed) returns 1 result matching Laptop', async () => {
    const res = await request(app).get('/products?search=%20laptop%20').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Laptop');
  });

  it('category=electronics returns 4 electronics products', async () => {
    const res = await request(app).get('/products?category=electronics').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    expect(res.body.data).toHaveLength(4);
    expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
  });

  it('category=Electronics (uppercase) returns same 4 results as lowercase', async () => {
    const res = await request(app).get('/products?category=Electronics').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    expect(res.body.data).toHaveLength(4);
  });

  it('category=nonexistent returns empty data and total 0', async () => {
    const res = await request(app).get('/products?category=nonexistent').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it('inStock=true returns 11 products all with inStock true', async () => {
    const res = await request(app).get('/products?inStock=true').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(11);
    expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === true)).toBe(true);
  });

  it('inStock=false returns 4 products all with inStock false', async () => {
    const res = await request(app).get('/products?inStock=false').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === false)).toBe(true);
  });

  it('sort=price_asc returns Jump Rope first at price 19', async () => {
    const res = await request(app).get('/products?sort=price_asc').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Jump Rope');
    expect(res.body.data[0].price).toBe(19);
  });

  it('sort=price_desc returns Laptop first at price 999', async () => {
    const res = await request(app).get('/products?sort=price_desc').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Laptop');
    expect(res.body.data[0].price).toBe(999);
  });

  it('sort=name_asc returns Bookshelf first', async () => {
    const res = await request(app).get('/products?sort=name_asc').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Bookshelf');
  });

  it('sort=name_desc returns Yoga Mat first', async () => {
    const res = await request(app).get('/products?sort=name_desc').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data[0].name).toBe('Yoga Mat');
  });

  it('category=electronics&inStock=true returns 3 in-stock electronics', async () => {
    const res = await request(app).get('/products?category=electronics&inStock=true').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data.every((p: { category: string; inStock: boolean }) => p.category === 'electronics' && p.inStock === true)).toBe(true);
  });

  it('search=chair&sort=price_desc returns Ergonomic Chair', async () => {
    const res = await request(app).get('/products?search=chair&sort=price_desc').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Ergonomic Chair');
  });
});

describe('Pagination', () => {
  it('default GET /products returns total 15, page 1, limit 10, totalPages 2, data length 10', async () => {
    const res = await request(app).get('/products').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(15);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.data).toHaveLength(10);
  });

  it('page=2 returns page 2 with 5 items and total 15', async () => {
    const res = await request(app).get('/products?page=2').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.data).toHaveLength(5);
    expect(res.body.total).toBe(15);
  });

  it('page 1 and page 2 product IDs are completely disjoint', async () => {
    const page1 = await request(app).get('/products?page=1').set(AUTH);
    const page2 = await request(app).get('/products?page=2').set(AUTH);
    const ids1: number[] = page1.body.data.map((p: { id: number }) => p.id);
    const ids2: number[] = page2.body.data.map((p: { id: number }) => p.id);
    const intersection = ids1.filter(id => ids2.includes(id));
    expect(intersection).toHaveLength(0);
  });

  it('limit=100 is clamped to 50 and returns all 15 products', async () => {
    const res = await request(app).get('/products?limit=100').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.limit).toBe(50);
    expect(res.body.data).toHaveLength(15);
  });
});

describe('Auth middleware', () => {
  it('no Authorization header returns 401 Unauthorized', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('invalid token benchmark-token-2023 (digit sum 7, odd) returns 401 Unauthorized', async () => {
    const res = await request(app).get('/products').set({ Authorization: 'Bearer benchmark-token-2023' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('valid token benchmark-token-2024 (digit sum 8, even) returns 200', async () => {
    const res = await request(app).get('/products').set({ Authorization: 'Bearer benchmark-token-2024' });
    expect(res.status).toBe(200);
  });

  it('GET /health with no Authorization header returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
