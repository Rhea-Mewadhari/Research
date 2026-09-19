import { vi } from 'vitest';

const mockFetchAllProducts = vi.hoisted(() => vi.fn());

vi.mock('../../../benchmark-backend/src/services/dataFetcher', () => ({
  fetchAllProducts: mockFetchAllProducts,
}));

// Spy on getAllProducts so we can assert it's called by the controller.
vi.mock('../../../benchmark-backend/src/services/productService', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...(mod as object),
    getAllProducts: vi.fn((mod as any).getAllProducts),
  };
});

import request from 'supertest';
import app from '../../../benchmark-backend/src/app';
import { products as MOCK_PRODUCTS } from '../../../benchmark-backend/src/data/products';
import * as productService from '../../../benchmark-backend/src/services/productService';

const AUTH = { Authorization: 'Bearer benchmark-token-2024' };

beforeAll(() => {
  mockFetchAllProducts.mockResolvedValue([...MOCK_PRODUCTS]);
});

describe('Hidden: service separation of concerns', () => {
  it('getAllProducts is called when the endpoint is hit', async () => {
    vi.clearAllMocks();
    mockFetchAllProducts.mockResolvedValue([...MOCK_PRODUCTS]);
    await request(app).get('/products?limit=50').set(AUTH);
    expect(productService.getAllProducts).toHaveBeenCalled();
  });

  it('sanitizeSearch is not exported from productService (dead export removed)', () => {
    // Vitest's vi.mock() guard throws on access to any property not present
    // in the mock factory's returned shape — including one that was
    // correctly removed — so probing via property access (`.sanitizeSearch`)
    // can never pass here regardless of the module's real content.
    // Object.keys() enumerates without triggering that guard.
    expect(Object.keys(productService)).not.toContain('sanitizeSearch');
  });

  it('filtering still works correctly after refactor', async () => {
    const res = await request(app)
      .get('/products?category=electronics&inStock=true&limit=50')
      .set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.every((p: any) => p.category === 'electronics')).toBe(true);
    expect(res.body.data.every((p: any) => p.inStock)).toBe(true);
  });

  it('sorting still works correctly after refactor', async () => {
    const res = await request(app).get('/products?sort=price_asc&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a: number, b: number) => a - b));
  });
});
