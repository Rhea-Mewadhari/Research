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
  it('filters by category=electronics', async () => {
    const res = await request(app).get('/products?category=electronics').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(4);
    expect(res.body.data.length).toBe(4);
    expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
  });

  it('filters by category=ELECTRONICS (case-insensitive)', async () => {
    const res = await request(app).get('/products?category=ELECTRONICS').set(AUTH);
    expect(res.body.total).toBe(4);
    expect(res.body.data.every((p: { category: string }) => p.category === 'electronics')).toBe(true);
  });

  it('filters by inStock=true', async () => {
    const res = await request(app).get('/products?inStock=true').set(AUTH);
    expect(res.body.total).toBe(11);
    expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === true)).toBe(true);
  });

  it('filters by inStock=false', async () => {
    const res = await request(app).get('/products?inStock=false').set(AUTH);
    expect(res.body.total).toBe(4);
    expect(res.body.data.every((p: { inStock: boolean }) => p.inStock === false)).toBe(true);
  });

  it('returns empty for nonexistent category', async () => {
    const res = await request(app).get('/products?category=nonexistent').set(AUTH);
    expect(res.body.total).toBe(0);
    expect(res.body.data.length).toBe(0);
  });

  it('searches LAPTOP case-insensitively', async () => {
    const res = await request(app).get('/products?search=LAPTOP').set(AUTH);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Laptop');
  });

  it('searches by partial match "smart"', async () => {
    const res = await request(app).get('/products?search=smart').set(AUTH);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Smartphone');
  });

  it('trims whitespace in search query', async () => {
    const res = await request(app).get('/products?search=%20laptop%20').set(AUTH);
    expect(res.body.total).toBe(1);
    expect(res.body.data[0].name).toBe('Laptop');
  });

  it('sorts by price_asc', async () => {
    const res = await request(app).get('/products?sort=price_asc').set(AUTH);
    expect(res.body.data[0].name).toBe('Jump Rope');
    expect(res.body.data[0].price).toBe(19);
  });

  it('sorts by price_desc', async () => {
    const res = await request(app).get('/products?sort=price_desc').set(AUTH);
    expect(res.body.data[0].name).toBe('Laptop');
    expect(res.body.data[0].price).toBe(999);
  });

  it('sorts by name_asc', async () => {
    const res = await request(app).get('/products?sort=name_asc').set(AUTH);
    expect(res.body.data[0].name).toBe('Bookshelf');
  });

  it('sorts by name_desc', async () => {
    const res = await request(app).get('/products?sort=name_desc').set(AUTH);
    expect(res.body.data[0].name).toBe('Yoga Mat');
  });

  it('combines category and inStock filters', async () => {
    const res = await request(app).get('/products?category=electronics&inStock=true').set(AUTH);
    expect(res.body.total).toBe(3);
    expect(
      res.body.data.every(
        (p: { category: string; inStock: boolean }) => p.category === 'electronics' && p.inStock === true
      )
    ).toBe(true);
  });
});

describe('Pagination', () => {
  it('returns correct envelope on default request', async () => {
    const res = await request(app).get('/products').set(AUTH);
    expect(res.body.data.length).toBe(10);
    expect(res.body.total).toBe(15);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
    expect(res.body.totalPages).toBe(2);
  });

  it('page=2 returns remaining products with no ID overlap', async () => {
    const page1 = await request(app).get('/products?page=1').set(AUTH);
    const res = await request(app).get('/products?page=2').set(AUTH);
    expect(res.body.data.length).toBe(5);
    expect(res.body.page).toBe(2);
    const page1Ids = new Set(page1.body.data.map((p: { id: number }) => p.id));
    expect(res.body.data.every((p: { id: number }) => !page1Ids.has(p.id))).toBe(true);
  });

  it('clamps limit to maximum of 50', async () => {
    const res = await request(app).get('/products?limit=100').set(AUTH);
    expect(res.body.limit).toBe(50);
    expect(res.body.data.length).toBe(15);
  });
});

describe('Auth middleware', () => {
  it('returns 401 with no Authorization header', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 401 with odd-digit-sum token', async () => {
    const res = await request(app).get('/products').set('Authorization', 'Bearer odd-token-1');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('returns 200 with valid even-digit-sum token', async () => {
    const res = await request(app).get('/products').set('Authorization', 'Bearer benchmark-token-2024');
    expect(res.status).toBe(200);
  });

  it('/health does not require auth', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
