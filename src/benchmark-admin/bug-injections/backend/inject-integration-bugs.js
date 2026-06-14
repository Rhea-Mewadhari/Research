import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../../benchmark-backend');

function write(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
}

// queryParser.ts — working but using camelCase sort keys instead of the
// frontend's hyphenated format (price-asc, price-desc, rating-desc).
// Unrecognised sort values are silently dropped, so frontend sort requests
// have no effect.
write(
  path.join(repoRoot, 'src', 'utils', 'queryParser.ts'),
  `import type { ProductQuery } from '../types/product';

type InternalSort = 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'nameAsc' | 'nameDesc';

const VALID_SORT_OPTIONS: InternalSort[] = ['priceAsc', 'priceDesc', 'ratingDesc', 'nameAsc', 'nameDesc'];

export function parseProductQuery(raw: Record<string, unknown>): ProductQuery & { sort?: InternalSort } {
  const query: ProductQuery & { sort?: InternalSort } = {};

  if (typeof raw.search === 'string') {
    query.search = raw.search;
  }

  if (typeof raw.category === 'string') {
    query.category = raw.category;
  }

  if (raw.inStock === 'true') {
    query.inStock = true;
  } else if (raw.inStock === 'false') {
    query.inStock = false;
  }

  if (VALID_SORT_OPTIONS.includes(raw.sort as InternalSort)) {
    query.sort = raw.sort as InternalSort;
  }

  const pageVal = parseInt(String(raw.page), 10);
  if (!isNaN(pageVal) && pageVal > 0) {
    query.page = pageVal;
  }

  const limitVal = parseInt(String(raw.limit), 10);
  if (!isNaN(limitVal) && limitVal > 0) {
    query.limit = Math.min(limitVal, 50);
  }

  return query;
}
`
);

// productService.ts — fully working filtering and sorting logic, but:
//   - Uses camelCase sort keys matching the broken queryParser
//   - Returns 'count' instead of 'total' and 'pages' instead of 'totalPages'
//     in the response envelope — mismatched from what the frontend expects
write(
  path.join(repoRoot, 'src', 'services', 'productService.ts'),
  `import { fetchAllProducts } from './dataFetcher';
import type { Product, ProductQuery } from '../types/product';

type InternalSort = 'priceAsc' | 'priceDesc' | 'ratingDesc' | 'nameAsc' | 'nameDesc';

export async function getAllProducts(query: ProductQuery & { sort?: InternalSort }): Promise<Record<string, unknown>> {
  const products = await fetchAllProducts();
  let result = [...products];

  if (query.search) {
    const term = query.search.trim().toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(term));
  }

  if (query.category) {
    result = result.filter(
      (p) => p.category.toLowerCase() === query.category!.toLowerCase()
    );
  }

  if (query.inStock !== undefined) {
    result = result.filter((p) => p.inStock === query.inStock);
  }

  if (query.sort === 'priceAsc') {
    result = [...result].sort((a, b) => a.price - b.price);
  } else if (query.sort === 'priceDesc') {
    result = [...result].sort((a, b) => b.price - a.price);
  } else if (query.sort === 'ratingDesc') {
    result = [...result].sort((a, b) => b.rating - a.rating);
  } else if (query.sort === 'nameAsc') {
    result = [...result].sort((a, b) => a.name.localeCompare(b.name));
  } else if (query.sort === 'nameDesc') {
    result = [...result].sort((a, b) => b.name.localeCompare(a.name));
  }

  const count = result.length;
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const pages = Math.ceil(count / limit);
  const data = result.slice((page - 1) * limit, page * limit);

  // 'count' and 'pages' are the wrong field names — frontend expects 'total' and 'totalPages'
  return { data, count, page, limit, pages };
}
`
);

// Rewrite visible tests to use the frontend's expected API contract:
//   - Hyphenated sort values (price-asc, price-desc, rating-desc)
//   - Response envelope fields: total, totalPages
// These tests will FAIL against the injected backend until the agent
// fixes queryParser and productService to match the frontend contract.
write(
  path.join(repoRoot, 'src', 'tests', 'visible', 'products.test.ts'),
  `import { vi } from 'vitest';

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
  it('returns all products with pagination envelope', async () => {
    const res = await request(app).get('/products?limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(15);
    expect(res.body.data.length).toBe(15);
  });

  it('filters by category', async () => {
    const res = await request(app).get('/products?category=electronics&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(4);
    expect(res.body.data.every((p: any) => p.category === 'electronics')).toBe(true);
  });

  it('returns empty array for unknown category', async () => {
    const res = await request(app).get('/products?category=nonexistent&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('filters in-stock products', async () => {
    const res = await request(app).get('/products?inStock=true&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(11);
    expect(res.body.data.every((p: any) => p.inStock)).toBe(true);
  });

  it('sorts by price ascending (frontend format)', async () => {
    const res = await request(app).get('/products?sort=price-asc&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('sorts by price descending (frontend format)', async () => {
    const res = await request(app).get('/products?sort=price-desc&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    const prices = res.body.data.map((p: any) => p.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('sorts by rating descending (frontend format)', async () => {
    const res = await request(app).get('/products?sort=rating-desc&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    const ratings = res.body.data.map((p: any) => p.rating);
    expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
  });

  it('filters by search term', async () => {
    const res = await request(app).get('/products?search=laptop&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data.every((p: any) => p.name.toLowerCase().includes('laptop'))).toBe(true);
  });

  it('returns empty data array when search matches nothing', async () => {
    const res = await request(app).get('/products?search=xyznonexistent&limit=50').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it('returns 401 without auth header', async () => {
    const res = await request(app).get('/products');
    expect(res.status).toBe(401);
  });
});

describe('Pagination', () => {
  it('response envelope contains total and totalPages', async () => {
    const res = await request(app).get('/products?page=1&limit=5').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('totalPages');
    expect(res.body.total).toBe(15);
    expect(res.body.totalPages).toBe(3);
  });

  it('returns correct envelope shape for first page', async () => {
    const res = await request(app).get('/products?page=1&limit=5').set(AUTH);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(5);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(5);
  });

  it('returns a different set of products for page 2', async () => {
    const page1 = await request(app).get('/products?page=1&limit=5').set(AUTH);
    const page2 = await request(app).get('/products?page=2&limit=5').set(AUTH);
    expect(page2.body.page).toBe(2);
    expect(page2.body.data.length).toBe(5);
    expect(page2.body.data).not.toEqual(page1.body.data);
  });

  it('clamps limit to a maximum of 50', async () => {
    const res = await request(app).get('/products?limit=100').set(AUTH);
    expect(res.body.limit).toBe(50);
    expect(res.body.data.length).toBeLessThanOrEqual(50);
  });
});

describe('Auth middleware', () => {
  it('rejects a token whose digits sum to an odd number', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer invalid-111');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized' });
  });

  it('accepts any token whose digits sum to an even number', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'Bearer custom-token-22');
    expect(res.status).toBe(200);
  });

  it('rejects a request with no Bearer prefix', async () => {
    const res = await request(app)
      .get('/products')
      .set('Authorization', 'benchmark-token-2024');
    expect(res.status).toBe(401);
  });

  it('does not apply auth to the /health route', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});
`
);
